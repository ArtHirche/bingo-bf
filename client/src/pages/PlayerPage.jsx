import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import PirateCard from '../components/PirateCard';
import BallCannon from '../components/BallCannon';
import NumberBoard from '../components/NumberBoard';
import PirateChat from '../components/PirateChat';
import { 
  ArrowLeft, 
  Plus, 
  Flame, 
  LayoutGrid, 
  MessageSquare, 
  Coins, 
  Scroll, 
  Users, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function PlayerPage({ roomId, onLeaveRoom }) {
  const { user } = useAuth();
  const { 
    currentRoom, 
    myCards, 
    requestCard, 
    lastDrawnNumber, 
    isCannonFiring 
  } = useSocket();

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showFullBoard, setShowFullBoard] = useState(false);

  const drawnNumbers = currentRoom?.drawnNumbers || [];
  const status = currentRoom?.status || 'waiting';

  const activeCard = myCards[activeCardIndex] || myCards[0];

  return (
    <div className="main-content-container">
      
      {/* Top Header do Marujo */}
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
            <h2 className="pirate-title gold-gradient-text" style={{ fontSize: '1.2rem', margin: 0 }}>
              Convés do Jack Down ⛵
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#b89868' }}>
              Sala: <strong>{roomId}</strong> • Capitão: <strong>{currentRoom?.moderatorName || 'Barba-Negra'}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {status === 'in_progress' ? (
            <span style={{ background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' }}>🟢 Sorteio em Andamento</span>
          ) : status === 'paused' ? (
            <span style={{ background: '#d97706', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' }}>⏸️ Pausado</span>
          ) : status === 'finished' ? (
            <span style={{ background: '#dc2626', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' }}>🏆 Bingo Conquistado!</span>
          ) : (
            <span style={{ background: '#4b5563', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' }}>⏳ Aguardando o Capitão</span>
          )}
        </div>
      </div>

      {/* Grid Principal do Jogador */}
      <div className="player-layout-grid">
        
        {/* Coluna Esquerda: Canhão de Sorteio e Referência */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <BallCannon 
            currentNumber={lastDrawnNumber || currentRoom?.currentNumber} 
            drawnNumbers={drawnNumbers}
            isFiring={isCannonFiring}
          />

          {/* Botão de Toggle da Tabela de 90 Pedras */}
          <button
            onClick={() => setShowFullBoard(!showFullBoard)}
            className="btn-pirate btn-wood"
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
          >
            {showFullBoard ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showFullBoard ? 'Ocultar Tabela 90 Pedras' : 'Ver Tabela de 90 Pedras'}</span>
          </button>

          {showFullBoard && (
            <NumberBoard 
              drawnNumbers={drawnNumbers}
              latestNumber={lastDrawnNumber || currentRoom?.currentNumber}
            />
          )}

        </div>

        {/* Coluna Central: Cartela(s) de 30 Números e Botão de BINGO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Seletor de Cartelas se houver mais de 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {myCards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`btn-pirate ${activeCardIndex === idx ? 'btn-gold' : 'btn-wood'}`}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  <Scroll size={14} /> Cartela {idx + 1}
                </button>
              ))}
            </div>

            {myCards.length < 2 && (
              <button
                onClick={requestCard}
                className="btn-pirate btn-wood"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                title="Pegar 2ª cartela de 30 números (Limite máximo de 2 cartelas)"
              >
                <Plus size={14} color="var(--gold-light)" /> + 2ª Cartela (Máx 2)
              </button>
            )}
          </div>

          {/* Exibição da Cartela de 30 Números */}
          {activeCard ? (
            <PirateCard 
              card={activeCard} 
              drawnNumbers={drawnNumbers}
            />
          ) : (
            <div className="pirate-panel" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: '#b89868' }}>Gerando seu mapa do tesouro...</p>
            </div>
          )}

        </div>

        {/* Coluna Direita: Taverna / Chat do Navio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <PirateChat />
        </div>

      </div>

    </div>
  );
}
