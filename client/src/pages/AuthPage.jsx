import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Skull, 
  Crown, 
  Anchor, 
  Dices, 
  KeyRound, 
  User as UserIcon, 
  Sparkles, 
  Ship, 
  Compass, 
  ShieldAlert 
} from 'lucide-react';

const PIRATE_AVATARS = [
  { id: 'sailor', name: 'Marujo', icon: '⚓', desc: 'Lobo do Mar' },
  { id: 'pirate_queen', name: 'Corsária', icon: '🗡️', desc: 'Rainha dos Mares' },
  { id: 'skull', name: 'Caveira', icon: '☠️', desc: 'Terror dos Oceanos' },
  { id: 'parrot', name: 'Papagaio', icon: '🦜', desc: 'Vigia da Gávea' },
  { id: 'corsair', name: 'Bucaneiro', icon: '⚔️', desc: 'Espadachim' },
  { id: 'mermaid', name: 'Sereia', icon: '🧜‍♀️', desc: 'Canto das Águas' }
];

const PIRATE_FIRST_NAMES = [
  'Barba Ruiva', 'Olho de Vidro', 'Jack', 'Anne', 'Corsário',
  'Perna de Pau', 'Lobo Salgado', 'Trovão', 'Navalha', 'Bucaneiro',
  'Sombra', 'Gavião', 'Morgan', 'Drake', 'Calico'
];

const PIRATE_TITLES = [
  'Destemido', 'dos Mares', 'Valente', 'das Trevas', 'de Ouro',
  'do Jack Down', 'Feroz', 'Vingador', 'Invencível', 'Clandestino'
];

export default function AuthPage({ onLoginSuccess, initialMode = 'marujo' }) {
  const { loginWithNickname, loginAsCommander } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'marujo' ou 'commander'
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('sailor');
  
  // Dados do Comandante
  const [commanderKey, setCommanderKey] = useState('');
  const [commanderNickname, setCommanderNickname] = useState('Capitão Barba-Negra');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Detectar se a URL atual possui /capitao ou #capitao
  useEffect(() => {
    const checkCaptainRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('capitao') || path.includes('comandante') || hash.includes('capitao') || hash.includes('comandante')) {
        setMode('commander');
      }
    };
    checkCaptainRoute();
    window.addEventListener('hashchange', checkCaptainRoute);
    return () => window.removeEventListener('hashchange', checkCaptainRoute);
  }, []);

  // Gerador de apelido pirata divertido
  const generateRandomNickname = () => {
    const first = PIRATE_FIRST_NAMES[Math.floor(Math.random() * PIRATE_FIRST_NAMES.length)];
    const title = PIRATE_TITLES[Math.floor(Math.random() * PIRATE_TITLES.length)];
    const randomNum = Math.floor(10 + Math.random() * 89);
    setNickname(`${first} ${title} ${randomNum}`);
  };

  // Submissão do Marujo (Apenas Nickname + Avatar)
  const handleMarujoSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Por favor, digite seu apelido ou clique no dado 🎲 para sortear um nome pirata!');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await loginWithNickname(nickname.trim(), avatar);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Erro ao embarcar no navio.');
    } finally {
      setLoading(false);
    }
  };

  // Submissão do Comandante (Chave Secreta)
  const handleCommanderSubmit = async (e) => {
    e.preventDefault();
    if (!commanderKey.trim()) {
      setError('Informe a chave secreta do capitão para assumir o timão!');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await loginAsCommander(commanderKey.trim(), commanderNickname.trim());
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Chave de comando incorreta!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', minHeight: 'calc(100dvh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 10px' }}>
      <div className="pirate-panel" style={{ maxWidth: '520px', width: '100%', padding: 'clamp(20px, 4vw, 36px) clamp(14px, 4vw, 28px)', position: 'relative' }}>
        
        {/* Ícone de Topo */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: mode === 'commander' 
              ? 'linear-gradient(135deg, #ef4444, #7f1d1d)' 
              : 'linear-gradient(135deg, #f59e0b, #b45309)',
            margin: '0 auto 10px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--gold-light)',
            boxShadow: mode === 'commander' ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 20px rgba(245, 158, 11, 0.4)'
          }}>
            {mode === 'commander' ? <Crown size={32} color="#fde047" /> : <Ship size={32} color="#120b06" />}
          </div>

          <h2 className="pirate-title gold-gradient-text" style={{ fontSize: 'clamp(1.35rem, 4.5vw, 1.9rem)', marginBottom: '4px' }}>
            {mode === 'commander' ? 'Cabine do Comandante' : 'Embarque no Jack Down'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#dfc89f' }}>
            {mode === 'commander' 
              ? 'Acesso exclusivo para o anfitrião controlar os canhões e o sorteio.' 
              : 'Digite seu apelido pirata e suba a bordo para jogar em tempo real!'}
          </p>
        </div>

        {/* Alternador de Abas: Marujo / Comandante */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0,0,0,0.5)', 
          borderRadius: '10px', 
          padding: '4px', 
          marginBottom: '22px', 
          border: '1px solid var(--wood-border)' 
        }}>
          <button
            type="button"
            onClick={() => { setMode('marujo'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: mode === 'marujo' ? 'var(--gold-primary)' : 'transparent',
              color: mode === 'marujo' ? '#120b06' : '#9ca3af',
              transition: 'all 0.2s ease'
            }}
          >
            <Anchor size={16} /> Marujo (Jogador)
          </button>
          
          <button
            type="button"
            onClick={() => { setMode('commander'); setError(null); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: mode === 'commander' ? 'var(--crimson-red)' : 'transparent',
              color: mode === 'commander' ? '#fff' : '#9ca3af',
              transition: 'all 0.2s ease'
            }}
          >
            <Crown size={16} /> Comandante (Host)
          </button>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div style={{ 
            background: 'rgba(127, 29, 29, 0.85)', 
            border: '1px solid #ef4444', 
            borderRadius: '8px', 
            padding: '12px 16px', 
            marginBottom: '18px', 
            color: '#fecaca', 
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldAlert size={20} color="#fca5a5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Formulário do Marujo (Apenas Nickname + Avatar) */}
        {mode === 'marujo' && (
          <form onSubmit={handleMarujoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Campo de Apelido com Botão de Dado */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: '#f3f4f6', fontWeight: 'bold' }}>
                  Seu Apelido Pirata:
                </label>
                <button
                  type="button"
                  onClick={generateRandomNickname}
                  title="Gerar nome pirata aleatório"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid var(--gold-dark)',
                    color: 'var(--gold-light)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 'bold'
                  }}
                >
                  <Dices size={14} /> Sortear Nome
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength={24}
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: Barba-Ruiva, Anne, Jack..."
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid var(--wood-border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1.05rem',
                    outline: 'none'
                  }}
                />
                <UserIcon size={20} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>

            {/* Seletor de Avatar Pirata */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', color: '#f3f4f6', fontWeight: 'bold', marginBottom: '8px' }}>
                Escolha seu Brasão / Avatar:
              </label>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '10px' 
              }}>
                {PIRATE_AVATARS.map((av) => {
                  const isSelected = avatar === av.id;
                  return (
                    <div
                      key={av.id}
                      onClick={() => setAvatar(av.id)}
                      style={{
                        background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.4)',
                        border: isSelected ? '2px solid var(--gold-light)' : '1px solid var(--wood-border)',
                        borderRadius: '8px',
                        padding: '10px 6px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 12px rgba(245, 158, 11, 0.3)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '1.6rem', marginBottom: '2px' }}>{av.icon}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: isSelected ? 'var(--gold-light)' : '#f3f4f6' }}>
                        {av.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botão de Embarque Instantâneo */}
            <button
              type="submit"
              disabled={loading}
              className="btn-pirate btn-gold"
              style={{ width: '100%', padding: '15px', marginTop: '6px', fontSize: '1.15rem', borderRadius: '10px' }}
            >
              {loading ? 'Preparando o Convés...' : '⚓ Subir a Bordo do Jack Down'}
            </button>
          </form>
        )}

        {/* 2. Formulário do Comandante (Chave Secreta) */}
        {mode === 'commander' && (
          <form onSubmit={handleCommanderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Chave Secreta */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', color: '#f3f4f6', fontWeight: 'bold', marginBottom: '6px' }}>
                Chave Secreta do Capitão (Host Key):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={commanderKey}
                  onChange={(e) => setCommanderKey(e.target.value)}
                  placeholder="Insira a chave do comandante..."
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid var(--wood-border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1.05rem',
                    outline: 'none'
                  }}
                />
                <KeyRound size={20} color="#ef4444" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>

            {/* Nome do Capitão (Opcional) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', color: '#f3f4f6', fontWeight: 'bold', marginBottom: '6px' }}>
                Título / Nome do Capitão (Opcional):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength={24}
                  value={commanderNickname}
                  onChange={(e) => setCommanderNickname(e.target.value)}
                  placeholder="Ex: Capitão Barba-Negra"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid var(--wood-border)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <Crown size={20} color="#f59e0b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>

            {/* Botão de Assumir Comando */}
            <button
              type="submit"
              disabled={loading}
              className="btn-pirate btn-crimson"
              style={{ width: '100%', padding: '15px', marginTop: '6px', fontSize: '1.15rem', borderRadius: '10px' }}
            >
              {loading ? 'Assumindo o Timão...' : '👑 Assumir o Comando do Navio'}
            </button>
          </form>
        )}

        {/* Rodapé com Atalho de Rota */}
        <div style={{ marginTop: '26px', paddingTop: '16px', borderTop: '1px dashed var(--wood-border)', textAlign: 'center' }}>
          {mode === 'marujo' ? (
            <p style={{ fontSize: '0.82rem', color: '#b89868' }}>
              É o anfitrião da partida?{' '}
              <span 
                onClick={() => { setMode('commander'); setError(null); }}
                style={{ color: 'var(--gold-light)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Acessar Cabine do Comandante 👑
              </span>
            </p>
          ) : (
            <p style={{ fontSize: '0.82rem', color: '#b89868' }}>
              Quer jogar como marujo?{' '}
              <span 
                onClick={() => { setMode('marujo'); setError(null); }}
                style={{ color: 'var(--gold-light)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Voltar para o Embarque Rápido ⚓
              </span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
