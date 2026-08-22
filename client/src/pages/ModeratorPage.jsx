import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import BallCannon from '../components/BallCannon';
import NumberBoard from '../components/NumberBoard';
import PirateChat from '../components/PirateChat';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Bomb, 
  Timer, 
  Users, 
  Crown, 
  Anchor, 
  Sparkles,
  ArrowLeft,
  Volume2
} from 'lucide-react';

export default function ModeratorPage({ roomId, onLeaveRoom }) {
  const { user } = useAuth();
  const { 
    currentRoom, 
    lastDrawnNumber, 
    isCannonFiring, 
    startGame, 
    pauseGame, 
    resetGame, 
    drawNumber, 
    setAutoDraw 
  } = useSocket();

  const [selectedInterval, setSelectedInterval] = useState(0);

  const drawnNumbers = currentRoom?.drawnNumbers || [];
  const status = currentRoom?.status || 'waiting';
  const players = currentRoom?.players || [];

  const handleAutoDrawChange = (sec) => {
    setSelectedInterval(sec);
    setAutoDraw(sec);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'in_progress':
        return <span style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>🟢 Partida em Andamento</span>;
      case 'paused':
        return <span style={{ background: '#d97706', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>⏸️ Pausada</span>;
      case 'finished':
        return <span style={{ background: '#dc2626', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>🏆 Rodada Conquistada!</span>;
      default:
        return <span style={{ background: '#4b5563', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>⏳ Aguardando Início</span>;
    }
  };

  return (
    <div className="main-content-container">
      
      {/* Top Header do Capitão */}
      <div className="pirate-panel" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={onLeaveRoom}
            className="btn-pirate btn-wood"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <ArrowLeft size={15} /> Voltar ao Porto
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={20} color="var(--gold-primary)" />
              <h2 className="pirate-title gold-gradient-text" style={{ fontSize: '1.2rem', margin: 0 }}>
                Cabine de Comando • Navio Jack Down
              </h2>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#b89868' }}>
              Sala: <strong>{roomId}</strong> • Capitão Oficial
            </span>
          </div>
        </div>

        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="moderator-layout-grid">
        
        {/* Coluna Esquerda: Canhão e Painel de Controle de Sorteio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Canhão de Sorteio */}
          <BallCannon 
            currentNumber={lastDrawnNumber || currentRoom?.currentNumber} 
            drawnNumbers={drawnNumbers}
            isFiring={isCannonFiring}
          />

          {/* Painel de Disparo */}
          <div className="pirate-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 className="pirate-title" style={{ fontSize: '1.1rem', color: '#fff', textAlign: 'center' }}>
              Disparar Canhão
            </h3>

            {/* Botão de Disparo Manual */}
            <button
              onClick={drawNumber}
              disabled={drawnNumbers.length >= 90}
              className="btn-pirate btn-crimson"
              style={{ padding: '16px', fontSize: '1.2rem', borderRadius: '12px', gap: '10px', boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)' }}
            >
              <Bomb size={24} />
              <span>DISPARAR PEDRA 💥</span>
            </button>

            {/* Controle de Sorteio Automático */}
            <div style={{ marginTop: '10px', borderTop: '1px solid var(--wood-border)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#d1d5db', marginBottom: '8px' }}>
                <Timer size={16} color="var(--gold-primary)" />
                <strong>Sorteio Automático:</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Off', sec: 0 },
                  { label: '3s', sec: 3 },
                  { label: '5s', sec: 5 },
                  { label: '8s', sec: 8 }
                ].map(({ label, sec }) => (
                  <button
                    key={sec}
                    onClick={() => handleAutoDrawChange(sec)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: `1px solid ${selectedInterval === sec ? 'var(--gold-primary)' : 'var(--wood-border)'}`,
                      background: selectedInterval === sec ? 'var(--gold-primary)' : 'rgba(0,0,0,0.4)',
                      color: selectedInterval === sec ? '#000' : '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controles de Partida */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', borderTop: '1px solid var(--wood-border)', paddingTop: '12px' }}>
              {status !== 'in_progress' ? (
                <button
                  onClick={startGame}
                  className="btn-pirate btn-gold"
                  style={{ padding: '10px', fontSize: '0.85rem' }}
                >
                  <Play size={16} /> Iniciar Jogo
                </button>
              ) : (
                <button
                  onClick={pauseGame}
                  className="btn-pirate btn-wood"
                  style={{ padding: '10px', fontSize: '0.85rem' }}
                >
                  <Pause size={16} /> Pausar
                </button>
              )}

              <button
                onClick={resetGame}
                className="btn-pirate btn-wood"
                style={{ padding: '10px', fontSize: '0.85rem' }}
              >
                <RotateCcw size={16} /> Nova Rodada
              </button>
            </div>

          </div>

        </div>

        {/* Coluna Central: Painel das 90 Pedras */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <NumberBoard 
            drawnNumbers={drawnNumbers}
            latestNumber={lastDrawnNumber || currentRoom?.currentNumber}
          />
        </div>

        {/* Coluna Direita: Jogadores e Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tripulação Conectada */}
          <div className="pirate-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--gold-primary)" />
                <h3 className="pirate-title" style={{ fontSize: '1rem', color: '#fff', textTransform: 'uppercase' }}>
                  Tripulação a Bordo
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold-light)', fontWeight: 'bold' }}>
                {players.length} Piratas
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {players.map((p) => (
                <div
                  key={p.socketId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--wood-border)',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚓</span>
                    <strong style={{ color: '#f3f4f6' }}>{p.username}</strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#b89868' }}>
                    {p.cardCount} cartela(s)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Pirata */}
          <PirateChat />

        </div>

      </div>

    </div>
  );
}
