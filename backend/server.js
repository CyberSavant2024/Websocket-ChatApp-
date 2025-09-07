import express from "express"


import dotenv from "dotenv"
 import { WebSocketServer } from "ws"



dotenv.config()

// Normalize port from environment (trim whitespace and convert to number)

const port = Number(process.env.PORT?.toString().trim()) ;

const wss = new WebSocketServer({ port });

let allUsers = [];

// Log when a new socket connection is established (before any messages)
wss.on('connection', socket => {
    console.log('WebSocket client connected');

    // Clean up when socket closes
    socket.on('close', () => {
        // remove all entries that match this socket
        const removed = allUsers.filter(u => u.socket === socket);
        allUsers = allUsers.filter(u => u.socket !== socket);
        // notify rooms affected
        const affectedRooms = [...new Set(removed.map(r => r.roomId))];
        affectedRooms.forEach(roomId => broadcastUserCount(roomId));
        console.log('WebSocket client disconnected');
    });

    socket.on('message', message => {
        // message can be a Buffer; convert to string and parse safely
        let parsedMessage;
        try {
            const messageStr = message.toString();
            parsedMessage = JSON.parse(messageStr);
        } catch (err) {
            console.error('Failed to parse incoming message:', err);
            return; // ignore malformed messages
        }

        if (parsedMessage.type === 'join') {
            // support both shapes: { type: 'join', roomId } and { type: 'join', payload: { roomId } }
            const roomId = parsedMessage.roomId ?? parsedMessage.payload?.roomId;
            if (!roomId) return;

            // remove any previous entries for this socket, then add the new one
            allUsers = allUsers.filter(u => u.socket !== socket);
            allUsers.push({ roomId, socket });
            console.log(`User joined room: ${roomId}`);

            // broadcast updated user count to everyone in the room
            broadcastUserCount(roomId);
            return;
        }

        if (parsedMessage.type === 'chat') {
            const roomId = parsedMessage.roomId ?? parsedMessage.payload?.roomId;
            if (!roomId) return;
            const usersInRoom = allUsers.filter(user => user.roomId === roomId);
            usersInRoom.forEach(user => {
                // send to all sockets in the room (including sender) if open
                if (user.socket && user.socket.readyState === 1) {
                    try {
                        user.socket.send(JSON.stringify({
                            type: 'chat',
                            message: parsedMessage.payload?.message ?? parsedMessage.message,
                            sender: parsedMessage.payload?.sender ?? parsedMessage.sender
                        }));
                    } catch (err) {
                        console.error('Failed to forward chat message:', err);
                    }
                }
            });
            console.log(`Forwarded message to room ${roomId}`, parsedMessage.payload?.message ?? parsedMessage.message);
        }
    });
});

// helper: send user count to all sockets in a room
function broadcastUserCount(roomId) {
    const usersInRoom = allUsers.filter(u => u.roomId === roomId);
    const count = usersInRoom.length;
    usersInRoom.forEach(u => {
        if (u.socket && u.socket.readyState === 1) {
            try {
                u.socket.send(JSON.stringify({ type: 'users', count }));
            } catch (err) {
                console.error('Failed to send user count:', err);
            }
        }
    });
}