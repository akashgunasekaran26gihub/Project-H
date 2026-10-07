import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { HabitProvider } from './context/HabitContext.jsx';
import { GamificationProvider } from './context/GamificationContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GamificationProvider>
        <HabitProvider>
          <App />
        </HabitProvider>
      </GamificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
