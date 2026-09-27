import { useState, type FormEvent } from 'react';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { ArrowRight, Cloud, KeyRound, LoaderCircle, Mail, Shield, UserPlus, X } from 'lucide-react';
import { auth, firebaseConfigured, prepareAuth } from './firebase';
import { AutoTranslate } from './i18n';
import type { User } from 'firebase/auth';
import { avatarOptions, type AvatarId } from './avatars';

type Props = { user: User | null; isAdmin: boolean; open: boolean; onClose: () => void; onOpenAdmin: () => void; cloudStatus: 'local' | 'loading' | 'saving' | 'saved' | 'offline'; avatar: AvatarId; onAvatarChange: (avatar: AvatarId) => void };
type AuthMode = 'login' | 'register';

function messageForError(code: string): string {
  if (code.includes('email-already-in-use')) return 'Ezzel az e-mail-címmel már létezik fiók. Jelentkezz be.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Hibás e-mail-cím vagy jelszó.';
  if (code.includes('weak-password')) return 'A jelszó legalább 6 karakter legyen.';
  if (code.includes('invalid-email')) return 'Érvénytelen e-mail-cím.';
  if (code.includes('too-many-requests')) return 'Túl sok próbálkozás. Próbáld meg később.';
  if (code.includes('network-request-failed')) return 'Nem sikerült kapcsolódni. Ellenőrizd az internetet.';
  if (code.includes('operation-not-allowed')) return 'A Firebase-ben még nincs bekapcsolva az e-mail/jelszó bejelentkezés.';
  return 'Nem sikerült a művelet. Ellenőrizd a Firebase-beállításokat, és próbáld újra.';
}

function AccountModal({ user, isAdmin, open, onClose, onOpenAdmin, cloudStatus, avatar, onAvatarChange }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setInfo('');
    if (!firebaseConfigured || !auth) {
      setError('A fiókokhoz Firebase-projekt szükséges. Kövesd a README Firebase-beállításait, majd töltsd ki a .env.local fájlt.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('A két jelszó nem egyezik.');
      return;
    }

    setBusy(true);
    try {
      await prepareAuth();
      if (mode === 'register') {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) await updateProfile(credential.user, { displayName: displayName.trim() });
        setInfo('A fiók elkészült, az adataid mentése elindult.');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onClose();
    } catch (cause) {
      setError(messageForError(cause instanceof Error && 'code' in cause ? String(cause.code) : 'unknown'));
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setError('');
    setInfo('');
    if (!firebaseConfigured || !auth) {
      setError('Előbb állítsd be a Firebase-t a README útmutatója alapján.');
      return;
    }
    if (!email.trim()) {
      setError('Add meg az e-mail-címedet a jelszó-visszaállításhoz.');
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Elküldtük a jelszó-visszaállító e-mailt. Nézd meg a postafiókodat.');
    } catch (cause) {
      setError(messageForError(cause instanceof Error && 'code' in cause ? String(cause.code) : 'unknown'));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (!auth) return;
    setBusy(true);
    setError('');
    try {
      await signOut(auth);
      onClose();
    } catch {
      setError('Nem sikerült kijelentkezni. Próbáld újra.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AutoTranslate>
    <div className="account-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <button className="account-close" onClick={onClose} aria-label="Bezárás"><X size={18} /></button>
        <div className="account-emblem"><Cloud size={24} /></div>
        {user ? <>
          <span className="section-kicker">FELHŐS JÁTÉKOSPROFIL</span>
          <h2 id="account-title">Szia, {user.displayName || 'játékos'}!</h2>
          <p className="account-description">A mentéseid ehhez a fiókhoz kapcsolódnak, így másik eszközön is folytathatod.</p>
          <div className="account-current-user"><span className="account-avatar">{avatar}</span><span><strong>{user.displayName || 'GameGuesser-játékos'}</strong><small>{user.email}</small></span><i className={`cloud-indicator-dot ${cloudStatus}`} /><small className="account-save-state">{cloudStatus === 'saved' ? 'Mentve' : cloudStatus === 'saving' || cloudStatus === 'loading' ? 'Mentés…' : 'Helyi mentés'}</small></div>
          <div className="avatar-picker"><span className="account-label">Válassz avatart</span><div className="avatar-picker-grid">{avatarOptions.map((option) => <button type="button" key={option} className={option === avatar ? 'selected' : ''} onClick={() => onAvatarChange(option)} aria-label={`Avatar ${option}`} aria-pressed={option === avatar}>{option}</button>)}</div></div>
          {info && <p className="account-message success-message">{info}</p>}
          {error && <p className="account-message error-message" role="alert">{error}</p>}
          {isAdmin && <button className="account-admin-link" onClick={onOpenAdmin}><Shield size={16} /> Admin kezelőfelület <ArrowRight size={16} /></button>}
          <button className="account-submit" onClick={logout} disabled={busy}>{busy ? <LoaderCircle className="account-spinner" size={17} /> : null} Kijelentkezés</button>
        </> : <>
          <span className="section-kicker">MENTSD EL A JÁTÉKOD</span>
          <h2 id="account-title">{mode === 'login' ? 'Üdv újra!' : 'Hozz létre fiókot'}</h2>
          <p className="account-description">A pontjaid és a félbehagyott kvízed elérhető marad, ha másik eszközön jelentkezel be.</p>
          <div className="avatar-picker"><span className="account-label">Válassz avatart</span><div className="avatar-picker-grid">{avatarOptions.map((option) => <button type="button" key={option} className={option === avatar ? 'selected' : ''} onClick={() => onAvatarChange(option)} aria-label={`Avatar ${option}`} aria-pressed={option === avatar}>{option}</button>)}</div></div>
          {!firebaseConfigured && <div className="firebase-setup-note"><strong>Firebase-beállítás szükséges</strong><span>A fiók létrehozásához előbb hozz létre Firebase-projektet, és add meg a webes konfigurációt a .env.local fájlban. A teljes útmutató a README-ben található.</span></div>}
          <form onSubmit={submit} className="account-form">
            {mode === 'register' && <label className="account-label"><span>Játékosnév</span><div className="account-input-wrap"><UserPlus size={16} /><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={28} placeholder="Hogy szólítsunk?" autoComplete="nickname" /></div></label>}
            <label className="account-label"><span>E-mail-cím</span><div className="account-input-wrap"><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="pelda@email.com" autoComplete="email" /></div></label>
            <label className="account-label"><span>Jelszó</span><div className="account-input-wrap"><KeyRound size={16} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="Legalább 6 karakter" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div></label>
            {mode === 'register' && <label className="account-label"><span>Jelszó megerősítése</span><div className="account-input-wrap"><KeyRound size={16} /><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={6} placeholder="Írd be újra a jelszót" autoComplete="new-password" /></div></label>}
            {error && <p className="account-message error-message" role="alert">{error}</p>}
            {info && <p className="account-message success-message">{info}</p>}
            <button className="account-submit" type="submit" disabled={busy}>{busy && <LoaderCircle className="account-spinner" size={17} />}{mode === 'login' ? 'Bejelentkezés' : 'Fiók létrehozása'} <ArrowRight size={17} /></button>
          </form>
          {mode === 'login' && <button className="forgot-password" onClick={resetPassword} disabled={busy}>Elfelejtetted a jelszavad?</button>}
          <div className="account-mode-switch">{mode === 'login' ? 'Még nincs fiókod?' : 'Már van fiókod?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo(''); }}>{mode === 'login' ? 'Regisztráció' : 'Bejelentkezés'}</button></div>
        </>}
      </section>
    </div>
    </AutoTranslate>
  );
}

export default AccountModal;
