// cacapreco-app/frontend/src/pages/Login.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPage as CdkLoginPage } from '@cidqueiroz/cdkteck-ui';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { user, login, register, loginWithGoogle, isLoading, error } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if user is already logged in
        if (user) {
            navigate('/dashboard-vendedor'); // Or a generic dashboard
        }
    }, [user, navigate]);

    const handleLogin = async ({ email, password }) => {
        try {
            await login(email, password);
            // The useEffect will handle the redirect
        } catch (err) {
            console.error("Login failed:", err);
            // Error is already set in the context
        }
    };
    
    const handleRegister = async ({ email, password }) => {
        try {
            await register(email, password);
            // The useEffect will handle the redirect
        } catch (err) {
            console.error("Registration failed:", err);
        }
    };
    
    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            // The useEffect will handle the redirect
        } catch (err) {
            console.error("Google login failed:", err);
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
            title="Monitore seus concorrentes no"
            imageSrc="/assets/lourdes.png"
        />
    );
};

export default Login;
