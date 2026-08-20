import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Navbar from './components/Navbar';
import VictoryModal from './components/VictoryModal';
import AuthPage from './pages/AuthPage';
import LobbyPage from './pages/LobbyPage';
import ModeratorPage from './pages/ModeratorPage';
import PlayerPage from './pages/PlayerPage';
import './styles/pirate.css';

function MainContent() {
  const { user, loading } = useAuth();
  const { toastMessage } = useSocket();
  const [currentView, setCurrentView] = useState('lobby');
  const [roomId, setRoomId] = useState(null);
  const [authMode, setAuthMode] = useState('marujo');

  // Detectar se a URL atual é a rota do Capitão (/capitao ou #capitao)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('capitao') || path.includes('comandante') || hash.includes('capitao') || hash.includes('comandante')) {
        setAuthMode('commander');
        if (user && user.role !== 'moderator') {
          setCurrentView('auth');
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-light)' }}>
        <h2 className="pirate-title">Içando as velas do navio... ⛵</h2>
      </div>
    );
  }

  // Se não estiver logado ou se pediu explicitamente a tela de login/auth
  if (!user || currentView === 'auth') {
    return (
      <>
        <Navbar onNavigate={(view) => {
          if (view === 'auth_commander') {
            setAuthMode('commander');
            setCurrentView('auth');
          } else {
            setCurrentView(view);
          }
        }} currentView="auth" roomId={null} />
        <AuthPage 
          initialMode={authMode} 
          onLoginSuccess={() => {
            setCurrentView('lobby');
            if (window.location.hash) window.location.hash = '';
          }} 
        />
      </>
    );
  }

  const handleEnterRoom = (selectedRoomId) => {
    setRoomId(selectedRoomId);
    setCurrentView('game');
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setCurrentView('lobby');
  };

  return (
    <>
      <Navbar onNavigate={(view) => {
        if (view === 'auth_commander') {
          setAuthMode('commander');
          setCurrentView('auth');
        } else {
          if (view === 'lobby') setRoomId(null);
          setCurrentView(view);
        }
      }} currentView={currentView} roomId={roomId} />

      {/* Notificação Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9999,
          background: toastMessage.type === 'error' ? '#7f1d1d' : '#14532d',
          color: '#fff',
          border: '1px solid ' + (toastMessage.type === 'error' ? '#ef4444' : '#22c55e'),
          padding: '12px 18px',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
          animation: 'fade-in 0.3s ease'
        }}>
          {toastMessage.text}
        </div>
      )}

      {/* Telas Principais */}
      {currentView === 'lobby' && (
        <LobbyPage onEnterRoom={handleEnterRoom} />
      )}

      {currentView === 'game' && roomId && (
        user.role === 'moderator' ? (
          <ModeratorPage roomId={roomId} onLeaveRoom={handleLeaveRoom} />
        ) : (
          <PlayerPage roomId={roomId} onLeaveRoom={handleLeaveRoom} />
        )
      )}

      {/* Modal de Vitória com Confetes e Moedas */}
      <VictoryModal />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainContent />
      </SocketProvider>
    </AuthProvider>
  );
}
