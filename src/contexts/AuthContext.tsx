import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  email: string;
  name?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  showAuthPopup: boolean;
  setShowAuthPopup: (show: boolean) => void;
  showSettingsPopup: boolean;
  setShowSettingsPopup: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  showAuthPopup: false,
  setShowAuthPopup: () => {},
  showSettingsPopup: false,
  setShowSettingsPopup: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/user');
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Intercept clicks if not logged in
  useEffect(() => {
    if (loading) return;
    
    const handleClick = (e: MouseEvent) => {
      if (user) return; // logged in, allow all clicks

      // If the click is inside the auth popup, allow it
      const target = e.target as HTMLElement;
      if (target.closest('.auth-popup-container')) {
        return;
      }

      // Intercept all clicks outside the auth popup
      e.preventDefault();
      e.stopPropagation();
      setShowAuthPopup(true);
    };

    document.addEventListener('click', handleClick, true); // use capture phase
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, showAuthPopup, setShowAuthPopup, showSettingsPopup, setShowSettingsPopup }}>
      {children}
    </AuthContext.Provider>
  );
};
