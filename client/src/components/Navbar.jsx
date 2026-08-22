import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../utils/audio';
import { 
  Compass, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  LogOut, 
  Crown, 
  Anchor, 
  Skull,
  User,
  KeyRound
} from 'lucide-react';

export default function Navbar({ onNavigate, currentView, roomId }) {
  const { user, logout } = useAuth();
  const [muted, setMuted] = useState(soundEffects.getIsMuted());
  const [speech, setSpeech] = useState(soundEffects.getSpeechEnabled());

  const handleToggleMute = () => {
    const isNowMuted = soundEffects.toggleMute();
    setMuted(isNowMuted);
  };

  const handleToggleSpeech = () => {
    const isNowSpeech = soundEffects.toggleSpeech();
    setSpeech(isNowSpeech);
  };

  return (
    <header className="pirate-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '10px 16px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Logo / Título */}
        <div 
          onClick={() => onNavigate('lobby')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #f59e0b, #b45309)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)',
            border: '2px solid #fde047',
            flexShrink: 0
          }}>
            <Compass size={22} color="#120b06" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="pirate-hero-font gold-gradient-text" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', lineHeight: 1, margin: 0 }}>
              BINGO PIRATA
            </h1>
            <span style={{ fontSize: '0.68rem', color: '#b89868', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Navio Jack Down 🏴‍☠️
            </span>
          </div>
        </div>

        {/* Informações da Sala Atual se houver */}
        {roomId && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(0, 0, 0, 0.4)', 
            padding: '6px 14px', 
            borderRadius: '20px',
            border: '1px solid var(--wood-border)'
          }}>
            <Anchor size={16} color="var(--gold-primary)" />
            <span style={{ fontSize: '0.85rem', color: '#d1d5db' }}>Sala:</span>
            <strong style={{ color: 'var(--gold-light)', letterSpacing: '1px' }}>{roomId}</strong>
          </div>
        )}

        {/* Ações do Usuário e Controles de Áudio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Controles de Áudio */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={handleToggleMute}
              title={muted ? 'Ativar Efeitos Sonoros' : 'Silenciar Efeitos'}
              className="btn-pirate btn-wood"
              style={{ padding: '8px', borderRadius: '50%', width: '38px', height: '38px' }}
            >
              {muted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="var(--gold-primary)" />}
            </button>

            <button 
              onClick={handleToggleSpeech}
              title={speech ? 'Desativar Narração de Voz' : 'Ativar Narração de Voz'}
              className="btn-pirate btn-wood"
              style={{ padding: '8px', borderRadius: '50%', width: '38px', height: '38px' }}
            >
              {speech ? <Mic size={18} color="var(--gold-primary)" /> : <MicOff size={18} color="#9ca3af" />}
            </button>
          </div>

          {/* Perfil do Pirata */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--wood-border)' }}>
              
              {/* Avatar */}
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: user.role === 'moderator' ? 'linear-gradient(135deg, #dc2626, #7f1d1d)' : 'linear-gradient(135deg, #0d9488, #115e59)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px solid var(--gold-light)'
              }}>
                {user.role === 'moderator' ? <Crown size={20} color="#fde047" /> : <Skull size={20} color="#f3f4f6" />}
              </div>

              {/* Nome e Cargo */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f3f4f6' }}>
                  {user.username}
                </span>
                <span style={{ fontSize: '0.72rem', color: user.role === 'moderator' ? '#f87171' : '#2dd4bf', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {user.role === 'moderator' ? '👑 Capitão' : '⚓ Marujo'}
                </span>
              </div>

              {/* Acesso rápido ao Capitão para o host se estiver como jogador */}
              {user.role !== 'moderator' && (
                <button
                  onClick={() => onNavigate('auth_commander')}
                  title="Acessar Cabine do Comandante 👑"
                  className="btn-pirate btn-wood"
                  style={{ padding: '6px 8px', marginLeft: '4px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Crown size={14} color="#f59e0b" />
                </button>
              )}

              {/* Botão Sair / Trocar de Apelido */}
              <button 
                onClick={logout} 
                title="Desembarcar / Trocar Apelido"
                className="btn-pirate btn-wood"
                style={{ padding: '6px', marginLeft: '2px', borderRadius: '6px' }}
              >
                <LogOut size={16} color="#ef4444" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => onNavigate('auth')} 
                className="btn-pirate btn-gold"
              >
                <User size={16} /> Subir a Bordo
              </button>
              <button 
                onClick={() => onNavigate('auth_commander')} 
                title="Cabine do Capitão"
                className="btn-pirate btn-crimson"
                style={{ padding: '8px 12px' }}
              >
                <Crown size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
