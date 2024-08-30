import React, { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    const newMessage = { user: 'User', text: input };
    setMessages([...messages, newMessage]);
    setInput('');

    const response = await fetch('/chat', { // Ensure this port matches your backend port
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: input, developerMode: isDeveloperMode }),
    });

    const data = await response.json();
    if (data.reply) {
      setMessages([...messages, newMessage, { user: 'AI', text: data.reply }]);
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((str, index) => (
      <p key={index}>{str}</p>
    ));
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="header">SEVY AI</div>
        <div className="chat-window">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.user}`}>
                <strong>{msg.user}: </strong>{formatMessage(msg.text)}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
        <div className="developer-mode-toggle">
          <label>
            <input
              type="checkbox"
              checked={isDeveloperMode}
              onChange={() => setIsDeveloperMode(!isDeveloperMode)}
            />
            Developer Mode
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;
