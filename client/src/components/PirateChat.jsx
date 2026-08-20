import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Send, Sparkles } from 'lucide-react';

const QUICK_PHRASES = [
  'Ahoy, marujos! ⚓',
  'Faltam poucas pedras! 🗺️',
  'Pela barba de Barba-Negra! ☠️',
  'Quase BINGO! 🔥',
  'O tesouro é meu! 💰',
  'Boa sorte a todos! 🦜'
];

export default function PirateChat() {
  const { currentRoom, sendChat } = useSocket();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const messages = currentRoom?.chat || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendChat(inputText);
    setInputText('');
  };

  const handleQuickSend = (phrase) => {
    sendChat(phrase);
  };

  return (
    <div className="pirate-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '420px' }}>
      
      {/* Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid var(--wood-border)', paddingBottom: '8px' }}>
        <MessageSquare size={18} color="var(--gold-primary)" />
        <h3 className="pirate-title" style={{ fontSize: '1rem', color: '#f3f4f6', textTransform: 'uppercase' }}>
          Taverna do Navio (Chat)
        </h3>
      </div>

      {/* Frases Rápidas Piratas */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px', scrollbarWidth: 'none' }}>
        {QUICK_PHRASES.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickSend(phrase)}
            className="btn-pirate btn-wood"
            style={{ fontSize: '0.72rem', padding: '4px 8px', whiteSpace: 'nowrap', borderRadius: '12px' }}
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Caixa de Mensagens */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginTop: '40px', fontStyle: 'italic' }}>
            A taverna está em silêncio... Mande a primeira mensagem, marujo!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-bubble ${msg.isSystem ? 'system' : ''}`}
            >
              <div className="sender">
                <span style={{ color: msg.role === 'moderator' ? '#f87171' : 'var(--gold-light)' }}>
                  {msg.role === 'moderator' ? '👑 ' : ''}{msg.sender}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 'normal' }}>
                  {msg.timestamp}
                </span>
              </div>
              <div style={{ color: '#f3f4f6', wordBreak: 'break-word' }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Campo de Envio */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Diga algo aos marujos..."
          maxLength={120}
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--wood-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          className="btn-pirate btn-gold"
          style={{ padding: '8px 14px' }}
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
}
