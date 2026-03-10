import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import styled from '@emotion/styled';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const PopupContainer = styled.div`
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  color: #333;
  text-align: center;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const Button = styled.button`
  padding: 12px;
  background: #2C5364;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 16px;
  &:hover {
    background: #203A43;
  }
`;

const ToggleText = styled.p`
  text-align: center;
  color: #666;
  margin: 0;
  span {
    color: #2C5364;
    cursor: pointer;
    font-weight: bold;
  }
`;

const ErrorText = styled.p`
  color: red;
  margin-top: -8px;
  margin-bottom: 16px;
  font-size: 14px;
  text-align: center;
`;

export const AuthPopup: React.FC = () => {
  const { showAuthPopup, setShowAuthPopup, setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!showAuthPopup) return null;

  const handleSubmit = async () => {
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post('/api/auth/login', { email, password });
        setUser(res.data.user);
        setShowAuthPopup(false);
      } else {
        const res = await axios.post('/api/auth/signup', { email, password, name });
        setUser(res.data.user);
        setShowAuthPopup(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <Overlay className="auth-popup-container" onClick={() => setShowAuthPopup(false)}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <Title>{isLogin ? 'Sign In' : 'Sign Up'}</Title>
        {error && <ErrorText>{error}</ErrorText>}
        {!isLogin && (
          <Input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        )}
        <Input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <Button onClick={handleSubmit}>{isLogin ? 'Sign In' : 'Sign Up'}</Button>
        <ToggleText>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </ToggleText>
      </PopupContainer>
    </Overlay>
  );
};
