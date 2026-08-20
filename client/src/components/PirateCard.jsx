import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Skull, Sparkles, CheckCircle2, Wand2, ShieldAlert } from 'lucide-react';

export default function PirateCard({ card, drawnNumbers = [] }) {
  const { markedNumbers, toggleMarkNumber, autoMarkDrawn, claimBingo, alarmMessage } = useSocket();

  const cardMarks = markedNumbers[card.id] || [];
  const markSet = new Set(cardMarks);
  const drawnSet = new Set(drawnNumbers);

  // Calcular progresso
  const markedCount = cardMarks.length;
  const isComplete = card.numbers.every(num => drawnSet.has(num));

  const handleAutoMark = () => {
    autoMarkDrawn(card.id, card.numbers, drawnNumbers);
  };

  const colRanges = ['1-15', '16-30', '31-45', '46-60', '61-75', '76-90'];

  return (
    <div className="parchment-card" style={{ padding: '20px', maxWidth: '560px', width: '100%', margin: '0 auto 24px auto' }}>
      
      {/* Cabeçalho da Cartela */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '2px dashed var(--parchment-border)', paddingBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#78350f', fontWeight: 'bold' }}>
            Mapa do Tesouro
          </span>
          <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', color: '#2c1a0e', margin: '2px 0 0 0' }}>
            {card.serialNumber}
          </h4>
        </div>

        {/* Contador de Marcados */}
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: '#78350f', fontWeight: 'bold' }}>Marcados:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', fontWeight: '900', color: markedCount >= 28 ? '#dc2626' : '#2c1a0e' }}>
              {markedCount} / 30
            </span>
            {markedCount === 30 && <CheckCircle2 size={18} color="#16a34a" />}
          </div>
        </div>
      </div>

      {/* Barra de Progresso da Cartela */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.15)', borderRadius: '3px', margin: '10px 0', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${(markedCount / 30) * 100}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #d97706, #dc2626)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Cabeçalhos das Colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', textAlign: 'center', marginTop: '6px' }}>
        {colRanges.map((range, idx) => (
          <div key={idx} style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#78350f', letterSpacing: '0.5px' }}>
            Col {idx + 1}
            <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>({range})</div>
          </div>
        ))}
      </div>

      {/* Grade de 30 Números (5x6) */}
      <div className="bingo-grid-30">
        {card.matrix.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            {row.map((num, cIdx) => {
              const isMarked = markSet.has(num);
              const isDrawn = drawnSet.has(num);
              const isDrawnUnmarked = isDrawn && !isMarked;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => toggleMarkNumber(card.id, num)}
                  className={`bingo-cell ${isMarked ? 'marked' : ''} ${isDrawnUnmarked ? 'drawn-unmarked' : ''}`}
                  title={isDrawnUnmarked ? 'Esta pedra já foi sorteada! Clique para carimbar!' : `Pedra ${num}`}
                >
                  <span>{num}</span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Barra de Ações Rápidas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <button
          onClick={handleAutoMark}
          className="btn-pirate btn-wood"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          title="Marca automaticamente todos os números já sorteados pelo Capitão"
        >
          <Wand2 size={15} color="var(--gold-light)" /> Auto-Marcar (Papagaio 🦜)
        </button>

        <span style={{ fontSize: '0.75rem', color: '#78350f', fontStyle: 'italic' }}>
          * Toque na pedra para carimbar a caveira ☠️
        </span>
      </div>

      {/* Alerta de Alarme Falso se houver */}
      {alarmMessage && (
        <div style={{ 
          marginTop: '14px', 
          background: '#fee2e2', 
          border: '2px solid #ef4444', 
          borderRadius: '8px', 
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#991b1b',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          animation: 'fade-in 0.3s ease'
        }}>
          <ShieldAlert size={20} color="#dc2626" />
          <span>{alarmMessage}</span>
        </div>
      )}

      {/* BOTÃO ÉPICO DE GRITAR BINGO */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => claimBingo(card.id)}
          className="btn-shout-bingo"
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <span>🏴‍☠️</span>
          <span>GRITAR BINGO!</span>
          <span>💰</span>
        </button>
      </div>

    </div>
  );
}
