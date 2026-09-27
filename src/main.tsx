import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './image-mode.css';
import './duel-mode.css';
import './duel-timer.css';
import './group-room.css';
import './account.css';
import './account-status.css';
import './admin.css';
import './leaderboard.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
