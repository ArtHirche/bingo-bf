import React from 'react';
import { Flame, History } from 'lucide-react';

export default function BallCannon({ currentNumber, drawnNumbers = [], isFiring = false }) {
  const totalDrawn = drawnNumbers.length;
  const recentNumbers = drawnNumbers.slice(-6, -1).reverse(); // 5 últimos antes do atual

  return (
    <div className="pirate-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* Título de Sorteio */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Flame size={20} color="var(--gold-primary)" />
        <h3 className="pirate-title gold-gradient-text" style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>
          Canhão de Pedras Sorteadas
        </h3>
      </div>

      {/* Globo / Bola Principal de Canhão */}
      <div style={{ position: 'relative', margin: '10px 0 20px 0' }}>
        <div 
          className={`cannon-ball-display ${isFiring ? 'cannon-fire-anim' : ''}`}
        >
          {currentNumber !== null && currentNumber !== undefined ? (
            <>
              <span>{currentNumber}</span>
              <span className="ball-label">Última Pedra</span>
            </>
          ) : (
            <span style={{ fontSize: '2rem', opacity: 0.3 }}>--</span>
          )}
        </div>
      </div>

      {/* Barra de Progresso do Marujo (X de 90 pedras) */}
      <div style={{ width: '100%', maxWidth: '340px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '4px' }}>
          <span>Pedras Disparadas</span>
          <strong style={{ color: 'var(--gold-light)' }}>{totalDrawn} / 90</strong>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--wood-border)' }}>
          <div 
            style={{ 
              width: `${(totalDrawn / 90) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Histórico das Últimas Pedras */}
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#b89868', marginBottom: '8px' }}>
          <History size={14} />
          <span>Últimas Pedras Chamadas:</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', minHeight: '42px', alignItems: 'center' }}>
          {recentNumbers.length > 0 ? (
            recentNumbers.map((num, idx) => (
              <div 
                key={idx}
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #2b180c, #140b05)', 
                  border: '2px solid var(--gold-dark)',
                  color: 'var(--gold-light)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                }}
              >
                {num}
              </div>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
              Nenhuma pedra anterior sorteada ainda.
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
