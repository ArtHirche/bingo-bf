import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, Crown, Sparkles, RotateCcw, X } from 'lucide-react';

export default function VictoryModal() {
  const { victoryData, setVictoryData, resetGame, currentRoom } = useSocket();
  const { user } = useAuth();

  if (!victoryData) return null;

  const isModerator = user?.role === 'moderator';

  return (
    <div className="victory-backdrop">
      <div className="victory-card">
        
        {/* Botão de Fechar */}
        <button
          onClick={() => setVictoryData(null)}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={22} />
        </button>

        {/* Ícone de Troféu e Caveira de Ouro */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #b45309)',
          margin: '0 auto 16px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.8)',
          border: '3px solid #fde047'
        }}>
          <Trophy size={42} color="#120b06" />
        </div>

        {/* Título */}
        <h2 className="pirate-hero-font gold-gradient-text" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '6px' }}>
          BINGO DOS SETE MARES!
        </h2>
        <p style={{ color: '#b89868', fontSize: '1rem', fontStyle: 'italic', marginBottom: '20px' }}>
          O grande baú de moedas de ouro foi conquistado!
        </p>

        {/* Caixa do Vencedor */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: '2px solid var(--gold-dark)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <Crown size={24} color="#f59e0b" />
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: '#fff', fontWeight: 'bold' }}>
              {victoryData.username}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#d1d5db' }}>
            Cartela Vencedora: <strong style={{ color: 'var(--gold-light)' }}>{victoryData.cardSerial || 'TESOURO SUPREMO'}</strong>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
            Pedras Sorteadas na Rodada: <strong>{victoryData.totalDrawn}</strong>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {isModerator ? (
            <button
              onClick={() => {
                resetGame();
                setVictoryData(null);
              }}
              className="btn-pirate btn-gold"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              <RotateCcw size={18} /> Iniciar Nova Rodada
            </button>
          ) : (
            <button
              onClick={() => setVictoryData(null)}
              className="btn-pirate btn-gold"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              <Sparkles size={18} /> Continuar a Bordo
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
