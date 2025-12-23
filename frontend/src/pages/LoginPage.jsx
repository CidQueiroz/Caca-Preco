// cacapreco-app/frontend/src/pages/LoginPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginPage as CdkLoginPage } from '@cidqueiroz/cdkteck-ui';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, register, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    try {
      await login(email, password);
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      // Error is handled in AuthContext
    }
  };

  const handleRegister = async ({ email, password }) => {
    try {
      await register(email, password);
      navigate('/'); // Redirect after successful registration
    } catch (err) {
      // Error is handled in AuthContext
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/'); // Redirect after successful Google login
    } catch (err) {
      // Error is handled in AuthContext
    }
  };

  return (
    <CdkLoginPage
      onLogin={handleLogin}
      onRegister={handleRegister}
      onGoogleLogin={handleGoogleLogin}
      isLoading={isLoading}
      error={error}
      appName="Caça-Preço"
    />
  );
};

export default LoginPage;
