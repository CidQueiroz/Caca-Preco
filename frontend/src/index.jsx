import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/Global.css';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);