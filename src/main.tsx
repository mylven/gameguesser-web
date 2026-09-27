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
import './admin-streamers.css';
import './leaderboard.css';
import './premium.css';
import './gamer-theme.css';
import './themes.css';
import './avatar.css';
import './responsive.css';
import './visits.css';
import './duel-leaderboard.css';
import './streamer.css';
import './streamer-directory.css';
import { I18nProvider } from './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider><App /></I18nProvider>
  </React.StrictMode>,
);
