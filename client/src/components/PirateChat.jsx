import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Sparkles, Flame, Smile, Volume2 } from 'lucide-react';

const QUICK_PHRASES = [
  'Ahoy, marujos! ⚓',
  'Faltam poucas pedras! 🗺️',
  'Pela barba de Barba-Negra! ☠️',
  'Quase BINGO! 🔥',
  'O tesouro é meu! 💰',
  'Boa sorte a todos! 🦜',
  'Desce mais um rum! 🍺',
  'Vento a favor! ⛵'
];

const QUICK_EMOJIS = ['🔥', '☠️', '💰', '🦜', '⚓', '🍺', '🎲', '😱'];

const AVATAR_MAP = {
  sailor: '⚓',
  pirate_queen: '🗡️',
  skull: '☠️',
  parrot: '🦜',
  corsair: '⚔️',
  mermaid: '🧜‍♀️',
  captain: '👑'
};

export default function PirateChat() {
  const { currentRoom, sendChat } = useSocket();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const messages = currentRoom?.chat || [];

  // Rolar automaticamente para o final sempre que novas mensagens chegarem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendChat(inputText.trim());
    setInputText('');
  };

  const handleQuickSend = (text) => {
    sendChat(text);
  };

  return (
    <div 
      className="pirate-panel" 
      style={{ 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '460px',
        background: 'linear-gradient(180deg, rgba(26, 17, 11, 0.95) 0%, rgba(13, 8, 5, 0.98) 100%)',
        border: '1px solid var(--wood-border)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
      }}
    >
      
      {/* Título & Status */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '10px', 
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)', 
          paddingBottom: '8px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            background: '#22c55e', 
            boxShadow: '0 0 8px #22c55e',
            animation: 'pulse 2s infinite'
          }} />
          <MessageSquare size={18} color="var(--gold-primary)" />
          <h3 className="pirate-title" style={{ fontSize: '1rem', color: '#f3f4f6', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
            Taverna do Navio
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          {messages.length} mensagens
        </span>
      </div>

      {/* Emojis Rápidos Piratas */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '4px', scrollbarWidth: 'none' }}>
        {QUICK_EMOJIS.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickSend(emoji)}
            className="btn-pirate"
            title={`Enviar ${emoji}`}
            style={{ 
              fontSize: '1rem', 
              padding: '2px 8px', 
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Frases Rápidas Piratas */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px', scrollbarWidth: 'none' }}>
        {QUICK_PHRASES.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickSend(phrase)}
            className="btn-pirate btn-wood"
            style={{ 
              fontSize: '0.72rem', 
              padding: '4px 10px', 
              whiteSpace: 'nowrap', 
              borderRadius: '12px',
              border: '1px solid var(--wood-border)',
              background: 'linear-gradient(180deg, #3a2213 0%, #20120a 100%)',
              color: 'var(--gold-light)'
            }}
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Caixa de Mensagens com Scroll suave */}
      <div 
        ref={chatContainerRef}
        className="chat-messages" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          paddingRight: '6px',
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '8px',
          padding: '10px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', marginTop: '60px', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '2rem' }}>🦜</span>
            A taverna está em silêncio... Mande a primeira mensagem ao vivo, marujo!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user && (user.username === msg.sender);
            const isMod = msg.role === 'moderator';
            const avatarIcon = AVATAR_MAP[msg.avatar] || (isMod ? '👑' : '⚓');

            return (
              <div 
                key={msg.id} 
                className={`chat-bubble ${msg.isSystem ? 'system' : ''}`}
                style={{
                  background: msg.isSystem 
                    ? 'rgba(239, 68, 68, 0.18)' 
                    : isMe 
                      ? 'rgba(245, 158, 11, 0.12)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  borderLeft: msg.isSystem 
                    ? '3px solid #ef4444' 
                    : isMod 
                      ? '3px solid #dc2626' 
                      : isMe 
                        ? '3px solid #22c55e' 
                        : '3px solid var(--gold-primary)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  transition: 'background 0.2s ease',
                  animation: 'fadeIn 0.25s ease'
                }}
              >
                <div className="sender" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ 
                    color: msg.isSystem ? '#fca5a5' : isMod ? '#f87171' : isMe ? '#86efac' : 'var(--gold-light)',
                    fontWeight: 'bold',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{msg.isSystem ? '🦜' : avatarIcon}</span>
                    <span>{msg.sender}</span>
                    {isMe && <span style={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: 'normal' }}>(Você)</span>}
                    {isMod && <span style={{ fontSize: '0.68rem', background: '#dc2626', color: '#fff', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>CAPITÃO</span>}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 'normal' }}>
                    {msg.timestamp}
                  </span>
                </div>
                <div style={{ color: msg.isSystem ? '#fecaca' : '#f3f4f6', wordBreak: 'break-word', fontSize: '0.88rem', lineHeight: '1.4' }}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Campo de Envio */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Diga algo aos marujos (Enter para enviar)..."
          maxLength={150}
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid var(--wood-border)',
            borderRadius: '6px',
            padding: '10px 14px',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--gold-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--wood-border)'}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-pirate btn-gold"
          style={{ 
            padding: '10px 16px',
            opacity: !inputText.trim() ? 0.6 : 1,
            cursor: !inputText.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
}
