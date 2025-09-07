import { useState, useRef, useEffect } from 'react'
import './styles.css'



function App() {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [ws, setWs] = useState(null)
  const [roomId, setRoomId] = useState('')
  const [joined, setJoined] = useState(false)
  const [username, setUsername] = useState('Anonymous')
  const chatRef = useRef(null)
  const [userCount, setUserCount] = useState(0)
  
  const joinRoom = () => {
    if (roomId.trim() === '') {
      alert('Please enter a room ID')
      return
    }
  // compute WS URL from env (Vite) or default to same host and backend port
  const defaultProto = location.protocol === 'https:' ? 'wss' : 'ws'
  const defaultWs = `${defaultProto}://${location.hostname}:5030`
  const wsUrl = import.meta.env.VITE_WS_URL || defaultWs

  // reuse existing socket if already connected
    if (ws && ws.readyState === WebSocket.OPEN) {
      // already connected
      ws.send(JSON.stringify({ type: 'join', payload: { roomId } }))
      setJoined(true)
      return
    }

  const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', payload: { roomId } }))
      setJoined(true)
    }

    socket.onmessage = (event) => {
      let parsedMessage
      try {
        parsedMessage = JSON.parse(event.data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
        return
      }

      if (parsedMessage.type === 'chat') {
        // support both shapes: { type:'chat', payload: { message, sender } }
        // and { type:'chat', message: '...', sender: '...' }
        const msgObj = parsedMessage.payload ?? { message: parsedMessage.message, sender: parsedMessage.sender }
        setChat(prevChat => [...prevChat, msgObj])
      }

      if (parsedMessage.type === 'users') {
        setUserCount(parsedMessage.count ?? 0)
      }
    }

    socket.onclose = () => {
      setJoined(false)
      setWs(null)
      console.log('WebSocket closed')
    }

    socket.onerror = (err) => {
      console.error('WebSocket error', err)
    }

    setWs(socket)
  }

  const sendMessage = () => {
    if (message.trim() === '') return
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat', payload: { roomId, message, sender: username } }))
      setMessage('')
    } else {
      alert('WebSocket is not connected.')
    }
  } 

  // auto-scroll when chat changes
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chat])
  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">💬 ChatApp</div>
          <div className="tagline">Real-time rooms</div>
        </div>
        <div className="header-right">
          <div className={`status-dot ${joined ? 'online' : 'offline'}`} />
          <div className="status-text">{joined ? 'Connected' : 'Not connected'}</div>
        </div>
      </header>
      <div className="card">
        <div className="sidebar">
          {!joined ? (
            <div>
              <div style={{ marginBottom: 12 }}>
                <input className="input" type="text" placeholder="Your name" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <input className="input" type="text" placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
              </div>
              <div className="controls">
                <button className="btn" onClick={joinRoom}>Join Room</button>
                <button className="btn secondary" onClick={() => { setRoomId(''); setUsername(''); }}>Clear</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="room-header">
                <div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Connected as</div>
                  <div style={{ fontWeight: 700 }}>{username}</div>
                </div>
                <div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Users</div>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>{userCount}</div>
                      </div>
                      <div style={{ marginLeft: 12 }}>
                        <button className="btn secondary" onClick={() => { ws?.close(); setJoined(false); setChat([]); setUserCount(0); }}>Leave</button>
                      </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Room: <strong>{roomId}</strong></div>
            </div>
          )}
        </div>

        <div className="main">
          <div className="chat-window" ref={chatRef}>
            {chat.length === 0 ? (
              <div style={{ color: 'var(--muted)', textAlign: 'center', marginTop: 40 }}>No messages yet — say hello 👋</div>
            ) : (
              chat.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === username ? 'own' : ''}`}>
                  <div className="meta">{msg.sender || 'Anonymous'}</div>
                  <div>{msg.message}</div>
                </div>
              ))
            )}
          </div>

          <div className="send-row">
            <input className="input" type="text" placeholder="Type your message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e)=> { if(e.key === 'Enter') sendMessage() }} />
            <button className="btn" onClick={sendMessage}>Send</button>
          </div>

          <div className="footer">Tip: open another tab to join the same room and test chat.</div>
        </div>
      </div>
    </div>
  )
}

export default App
