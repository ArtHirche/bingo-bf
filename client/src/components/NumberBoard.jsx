import React from 'react';
import { LayoutGrid } from 'lucide-react';

export default function NumberBoard({ drawnNumbers = [], latestNumber = null }) {
  const drawnSet = new Set(drawnNumbers);
  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <div className="pirate-panel" style={{ padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutGrid size={18} color="var(--gold-primary)" />
          <h3 className="pirate-title" style={{ fontSize: '1rem', color: '#f3f4f6', textTransform: 'uppercase' }}>
            Painel das 90 Pedras
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#b89868' }}>
          {drawnNumbers.length} Sorteadas / {90 - drawnNumbers.length} Restantes
        </span>
      </div>

      {/* Grade 10 colunas x 9 linhas */}
      <div className="number-board-grid">
        {allNumbers.map(num => {
          const isDrawn = drawnSet.has(num);
          const isLatest = num === latestNumber;

          return (
            <div
              key={num}
              className={`board-num-badge ${isDrawn ? 'drawn' : ''} ${isLatest ? 'latest' : ''}`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}
