import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadKeys } from '../utils/data';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  if (!currentUser) return <div className="container"><h2>No estás logueado</h2></div>;

  const handleSave = () => {
    updateProfile({ displayName, bio });
    alert('Perfil guardado');
  };

  const { createKey } = useAuth();
  const [keys, setKeys] = useState(() => loadKeys());
  const { renewKeyForUser } = useAuth();
  const [renewKeyValue, setRenewKeyValue] = useState('');

  const handleCreateKey = () => {
    const k = createKey({ daysValid: 7, singleUse: false, role: 'user' });
    setKeys(loadKeys());
    setCreatedKey(k.key);
    navigator.clipboard?.writeText(k.key);
    alert('Key de usuario creada (copiada al portapapeles): ' + k.key);
  };

  const handleCreateMasterKey = () => {
    const k = createKey({ daysValid: null, singleUse: true, role: 'owner' });
    setKeys(loadKeys());
    setCreatedKey(k.key);
    navigator.clipboard?.writeText(k.key);
    alert('Master key creada (single-use) copiada al portapapeles: ' + k.key);
  };

  const [createdKey, setCreatedKey] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  React.useEffect(() => {
    let tId;
    const update = () => {
      if (currentUser && currentUser.keyExpiresAt) {
        const ms = new Date(currentUser.keyExpiresAt) - Date.now();
        if (ms <= 0) setTimeLeft('Expirada');
        else {
          const days = Math.floor(ms / (24*3600*1000));
          const hrs = Math.floor((ms % (24*3600*1000)) / (3600*1000));
          const mins = Math.floor((ms % (3600*1000)) / (60*1000));
          setTimeLeft(`${days}d ${hrs}h ${mins}m`);
        }
      } else setTimeLeft('No definido');
    };
    update();
    tId = setInterval(update, 60*1000);
    return () => clearInterval(tId);
  }, [currentUser]);

  return (
    <main className="container">
      <h2 className="neon">Perfil de {currentUser.username}</h2>
      <div className="card">
        <label>Nombre visible</label>
        <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
        <label>Bio</label>
        <textarea value={bio} onChange={(e)=>setBio(e.target.value)} rows={4} />
        <div style={{ marginTop: '0.5rem' }}>
          <button onClick={handleSave}>Guardar</button>
        </div>
      </div>
      {currentUser && currentUser.keyRole === 'owner' && (
        <div style={{ marginTop: '1rem' }} className="card">
          <h3>Administración de keys</h3>
          <p>Puedes crear claves de acceso para invitar usuarios (cada 7 días por defecto).</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCreateKey}>Crear key usuario (7 días)</button>
            <button onClick={handleCreateMasterKey}>Crear master key (single-use)</button>
          </div>
          {createdKey && (
            <div style={{ marginTop: '0.5rem' }}>
              <label>Última key creada</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input readOnly value={createdKey} style={{ flex: 1 }} />
                <button onClick={() => navigator.clipboard?.writeText(createdKey)}>Copiar</button>
              </div>
            </div>
          )}
          <div style={{ marginTop: '0.5rem' }}>
            <h4>Keys existentes</h4>
            <ul>
              {keys.map(k => (
                <li key={k.key}>{k.key} — {k.role} {k.expiresAt ? `(expira ${new Date(k.expiresAt).toLocaleString()})` : ''} {k.used ? '(usada)' : ''}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {currentUser && currentUser.keyRole !== 'owner' && (
        <div style={{ marginTop: '1rem' }} className="card">
          <h3>Estado de tu key</h3>
          <p>Tu perfil expira: {currentUser.keyExpiresAt ? new Date(currentUser.keyExpiresAt).toLocaleString() : 'No definido'}</p>
          <p>Tiempo restante: {timeLeft}</p>
          <p>Si tu key expira, pega aquí la nueva key que te haya dado el owner para renovar tu acceso:</p>
          <input value={renewKeyValue} onChange={(e)=>setRenewKeyValue(e.target.value)} placeholder="Pegar nueva key" />
          <div style={{ marginTop: '0.5rem' }}>
            <button onClick={() => { try { renewKeyForUser(currentUser.username, renewKeyValue); setKeys(loadKeys()); alert('Perfil renovado'); } catch (err) { alert(err.message); } }}>Renovar key</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;
