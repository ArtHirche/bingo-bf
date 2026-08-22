import React, { useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { Skull, Sparkles, CheckCircle2, Wand2, ShieldAlert, Flame, Trophy } from 'lucide-react';

export default function PirateCard({ card, drawnNumbers = [] }) {
  const { markedNumbers, toggleMarkNumber, autoMarkDrawn, claimBingo, alarmMessage } = useSocket();

  const cardMarks = markedNumbers[card.id] || [];
  const markSet = new Set(cardMarks);
  const drawnSet = new Set(drawnNumbers);

  const markedCount = cardMarks.length;

  // Avaliação de Linhas no cliente (Horizontais, Verticais e Diagonais)
  const lineStats = useMemo(() => {
    if (!card || !card.matrix) return { hasBingo: false, completed: [], bestLine: null, winningCells: new Set() };
    const matrix = card.matrix;
    const rows = matrix.length; // 5
    const cols = matrix[0].length; // 6
    const allLines = [];

    // 1. Horizontais (5 linhas de 6 pedras)
    for (let r = 0; r < rows; r++) {
      const numbers = matrix[r];
      const drawn = numbers.filter(n => drawnSet.has(n));
      const missing = numbers.filter(n => !drawnSet.has(n));
      allLines.push({
        type: 'horizontal',
        name: `Linha Horizontal ${r + 1}`,
        numbers,
        drawnCount: drawn.length,
        totalRequired: cols,
        missingCount: missing.length,
        isComplete: missing.length === 0,
        indices: numbers.map((_, c) => `${r}-${c}`)
      });
    }

    // 2. Verticais (6 colunas de 5 pedras)
    for (let c = 0; c < cols; c++) {
      const numbers = [];
      const indices = [];
      for (let r = 0; r < rows; r++) {
        numbers.push(matrix[r][c]);
        indices.push(`${r}-${c}`);
      }
      const drawn = numbers.filter(n => drawnSet.has(n));
      const missing = numbers.filter(n => !drawnSet.has(n));
      allLines.push({
        type: 'vertical',
        name: `Coluna ${c + 1}`,
        numbers,
        drawnCount: drawn.length,
        totalRequired: rows,
        missingCount: missing.length,
        isComplete: missing.length === 0,
        indices
      });
    }

    // 3. Diagonais (4 diagonais de tamanho 5)
    // Diagonal 1: (0,0) -> (4,4)
    const diag1 = [];
    const diag1Idx = [];
    for (let r = 0; r < rows; r++) {
      diag1.push(matrix[r][r]);
      diag1Idx.push(`${r}-${r}`);
    }
    allLines.push({
      type: 'diagonal',
      name: 'Diagonal Principal (Esq ➔ Dir)',
      numbers: diag1,
      drawnCount: diag1.filter(n => drawnSet.has(n)).length,
      totalRequired: rows,
      missingCount: diag1.filter(n => !drawnSet.has(n)).length,
      isComplete: diag1.every(n => drawnSet.has(n)),
      indices: diag1Idx
    });

    // Diagonal 2: (0,1) -> (4,5)
    const diag2 = [];
    const diag2Idx = [];
    for (let r = 0; r < rows; r++) {
      diag2.push(matrix[r][r + 1]);
      diag2Idx.push(`${r}-${r + 1}`);
    }
    allLines.push({
      type: 'diagonal',
      name: 'Diagonal Secundária (Esq ➔ Dir)',
      numbers: diag2,
      drawnCount: diag2.filter(n => drawnSet.has(n)).length,
      totalRequired: rows,
      missingCount: diag2.filter(n => !drawnSet.has(n)).length,
      isComplete: diag2.every(n => drawnSet.has(n)),
      indices: diag2Idx
    });

    // Anti 1: (0,5) -> (4,1)
    const anti1 = [];
    const anti1Idx = [];
    for (let r = 0; r < rows; r++) {
      const c = 5 - r;
      anti1.push(matrix[r][c]);
      anti1Idx.push(`${r}-${c}`);
    }
    allLines.push({
      type: 'diagonal',
      name: 'Diagonal Inversa 1',
      numbers: anti1,
      drawnCount: anti1.filter(n => drawnSet.has(n)).length,
      totalRequired: rows,
      missingCount: anti1.filter(n => !drawnSet.has(n)).length,
      isComplete: anti1.every(n => drawnSet.has(n)),
      indices: anti1Idx
    });

    // Anti 2: (0,4) -> (4,0)
    const anti2 = [];
    const anti2Idx = [];
    for (let r = 0; r < rows; r++) {
      const c = 4 - r;
      anti2.push(matrix[r][c]);
      anti2Idx.push(`${r}-${c}`);
    }
    allLines.push({
      type: 'diagonal',
      name: 'Diagonal Inversa 2',
      numbers: anti2,
      drawnCount: anti2.filter(n => drawnSet.has(n)).length,
      totalRequired: rows,
      missingCount: anti2.filter(n => !drawnSet.has(n)).length,
      isComplete: anti2.every(n => drawnSet.has(n)),
      indices: anti2Idx
    });

    const completed = allLines.filter(l => l.isComplete);
    const sorted = [...allLines].sort((a, b) => a.missingCount - b.missingCount);
    const bestLine = sorted[0];

    const winningCells = new Set();
    completed.forEach(l => l.indices.forEach(idx => winningCells.add(idx)));

    return {
      hasBingo: completed.length > 0,
      completed,
      bestLine,
      winningCells
    };
  }, [card, drawnNumbers]);

  const handleAutoMark = () => {
    autoMarkDrawn(card.id, card.numbers, drawnNumbers);
  };

  const colRanges = ['1-15', '16-30', '31-45', '46-60', '61-75', '76-90'];

  const bestLineProgressPercent = lineStats.bestLine
    ? Math.round((lineStats.bestLine.drawnCount / lineStats.bestLine.totalRequired) * 100)
    : 0;

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

        {/* Status da Melhor Linha e Marcados */}
        <div style={{ textAlign: 'right' }}>
          {lineStats.hasBingo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', animation: 'pulse 1s infinite' }}>
              <Trophy size={16} /> LINHA COMPLETA!
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#78350f', fontWeight: 'bold' }}>
                Melhor Linha ({lineStats.bestLine?.name || 'Geral'}):
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', fontWeight: '900', color: lineStats.bestLine?.missingCount <= 1 ? '#dc2626' : '#2c1a0e' }}>
                  {lineStats.bestLine?.drawnCount || 0} / {lineStats.bestLine?.totalRequired || 5}
                </span>
                {lineStats.bestLine?.missingCount === 1 && (
                  <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 'bold' }}>🔥 Falta 1!</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Progresso da Melhor Linha */}
      <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', margin: '12px 0 8px 0', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${bestLineProgressPercent}%`, 
            height: '100%', 
            background: lineStats.hasBingo 
              ? 'linear-gradient(90deg, #16a34a, #22c55e)' 
              : 'linear-gradient(90deg, #d97706, #dc2626)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Legenda de Regra */}
      <div style={{ fontSize: '0.74rem', color: '#78350f', marginBottom: '8px', textAlign: 'center', fontWeight: '600' }}>
        ⚔️ Regra: Complete qualquer <strong>Linha Horizontal</strong> (6), <strong>Vertical</strong> (5) ou <strong>Diagonal</strong> (5)!
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
              const isWinningCell = lineStats.winningCells.has(`${rIdx}-${cIdx}`);

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => toggleMarkNumber(card.id, num)}
                  className={`bingo-cell ${isMarked ? 'marked' : ''} ${isDrawnUnmarked ? 'drawn-unmarked' : ''} ${isWinningCell ? 'winning-line' : ''}`}
                  title={
                    isWinningCell
                      ? '⭐ Esta pedra faz parte de uma LINHA VENCEDORA!'
                      : isDrawnUnmarked
                      ? 'Esta pedra já foi sorteada! Clique para carimbar!'
                      : `Pedra ${num}`
                  }
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
          * Pedras marcadas: <strong>{markedCount}/30</strong>
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
          className={`btn-shout-bingo ${lineStats.hasBingo ? 'ready-to-win' : ''}`}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <span>🏴‍☠️</span>
          <span>{lineStats.hasBingo ? '🏆 GRITAR BINGO AGORA! 🏆' : 'GRITAR BINGO!'}</span>
          <span>💰</span>
        </button>
      </div>

    </div>
  );
}

