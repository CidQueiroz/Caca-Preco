import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MonitoringProvider } from './context/MonitoringContext';
import { ThemeProvider } from '@cidqueiroz/cdkteck-ui';
import '@cidqueiroz/cdkteck-ui/global.css'; // Correct global CSS import
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <MonitoringProvider>
              <App />
            </MonitoringProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);