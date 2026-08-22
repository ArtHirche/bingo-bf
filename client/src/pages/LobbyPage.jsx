import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Ship, Compass, Trophy, Scroll, Users, Crown, ShieldCheck } from 'lucide-react';

export default function LobbyPage({ onEnterRoom }) {
  const { user } = useAuth();
  const { joinRoom } = useSocket();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleJoin = () => {
    joinRoom('JACK-DOWN');
    onEnterRoom('JACK-DOWN');
  };

  return (
    <div className="main-content-container" style={{ maxWidth: '1200px' }}>
      
      {/* Banner Principal do Navio Jack Down */}
      <div className="pirate-panel" style={{ padding: 'clamp(20px, 4vw, 32px) clamp(14px, 3vw, 24px)', marginBottom: '20px', textAlign: 'center', background: 'linear-gradient(180deg, #3a2010 0%, #170d06 100%)' }}>
        <h1 className="pirate-hero-font gold-gradient-text" style={{ fontSize: 'clamp(1.8rem, 6vw, 3.2rem)', marginBottom: '8px' }}>
          NAVIO JACK DOWN 🏴‍☠️
        </h1>
        <p style={{ color: '#f5e6cb', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', maxWidth: '700px', margin: '0 auto 18px auto' }}>
          Bem-vindo ao bando <strong style={{ color: 'var(--gold-light)' }}>Black Flags</strong>, {user?.role === 'moderator' ? '👑 Capitão' : 'marujo'} <strong style={{ color: 'var(--gold-light)' }}>{user?.username}</strong>!
        </p>

        {/* Botão de Embarque na Sala Única */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {user?.role === 'moderator' ? (
            <button
              onClick={handleJoin}
              className="btn-pirate btn-crimson"
              style={{ fontSize: '1.1rem', padding: '14px 28px', borderRadius: '30px' }}
            >
              <Crown size={22} /> Assumir Comando do Jack Down 👑
            </button>
          ) : (
            <button
              onClick={handleJoin}
              className="btn-pirate btn-gold"
              style={{ fontSize: '1.1rem', padding: '14px 28px', borderRadius: '30px' }}
            >
              <Ship size={22} /> Subir ao Convés do Jack Down ⛵
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
        
        {/* Painel: Informações da Sala Única Oficial */}
        <div className="pirate-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--wood-border)', paddingBottom: '10px' }}>
            <Compass size={22} color="var(--gold-primary)" />
            <h3 className="pirate-title" style={{ fontSize: '1.2rem', color: '#fff' }}>
              Sala Oficial do Bando
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--wood-border)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Navio Oficial Único</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: 'var(--gold-light)', fontWeight: 'bold' }}>JACK DOWN</div>
              <div style={{ fontSize: '0.82rem', color: '#d1d5db', marginTop: '4px' }}>Todos os marujos e o Capitão jogam juntos nesta mesma sala.</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--wood-border)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Comando Único</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <Crown size={18} color="#f59e0b" />
                <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>Capitão Barba-Negra (ADM Único)</span>
              </div>
            </div>

            <button
              onClick={handleJoin}
              className="btn-pirate btn-crimson"
              style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '1rem' }}
            >
              Entrar no Convés Agora 🚪
            </button>
          </div>
        </div>

        {/* Painel: Regras Oficiais do Jack Down */}
        <div className="parchment-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '2px dashed var(--parchment-border)', paddingBottom: '8px' }}>
            <Scroll size={22} color="#78350f" />
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', color: '#2c1a0e' }}>
              Leis do Navio Jack Down
            </h3>
          </div>

          <ul style={{ fontSize: '0.88rem', color: '#3c2313', lineHeight: 1.6, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Sala Única:</strong> Não existem divisões — toda a tripulação do Black Flags joga junta no Jack Down.
            </li>
            <li>
              <strong>Até 2 Cartelas por Jogador:</strong> Cada marujo pode jogar com 1 ou até 2 cartelas de 30 números (5x6, intervalo 1-90).
            </li>
            <li>
              <strong>1 Capitão Oficial:</strong> Apenas o Administrador oficial dispara as pedras de canhão e comanda o ritmo das rodadas.
            </li>
            <li>
              <strong>Gritar BINGO:</strong> Complete qualquer linha perfeita (Horizontal, Vertical ou Diagonal) em sua cartela para conquistar o baú do tesouro com 500 moedas de ouro!
            </li>
          </ul>
        </div>

        {/* Painel: Livro de Honra dos Vencedores */}
        <div className="pirate-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Trophy size={22} color="var(--gold-primary)" />
            <h3 className="pirate-title gold-gradient-text" style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>
              Livro de Ouro dos Campeões do Jack Down
            </h3>
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Consultando pergaminhos antigos...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px', fontStyle: 'italic' }}>
              Ainda não há vencedores registrados. Seja o primeiro campeão do bando Black Flags!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {history.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--wood-border)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #b45309)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fde047'
                  }}>
                    <Crown size={20} color="#120b06" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>{item.winner_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>Navio Jack Down</div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{item.total_numbers_drawn} pedras sorteadas</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
