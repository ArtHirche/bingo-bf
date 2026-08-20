import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bingo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bingo_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validar token no carregamento
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('bingo_user', JSON.stringify(data.user));
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // Entrada rápida para Marujos com Nickname e Avatar
  const loginWithNickname = async (nickname, avatar) => {
    const res = await fetch('/api/auth/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, avatar })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao subir a bordo.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('bingo_token', data.token);
    localStorage.setItem('bingo_user', JSON.stringify(data.user));
    return data.user;
  };

  // Entrada do Comandante com Chave Secreta
  const loginAsCommander = async (key, nickname) => {
    const res = await fetch('/api/auth/commander', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, nickname })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Chave de comando incorreta!');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('bingo_token', data.token);
    localStorage.setItem('bingo_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bingo_token');
    localStorage.removeItem('bingo_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      loginWithNickname, 
      loginAsCommander, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
