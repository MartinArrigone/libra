import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) setMessage(error.message)
      else setMessage('¡Registro exitoso! Revisá tu email para confirmar tu cuenta.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    }

    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Libra</h1>
        <p style={styles.tagline}>Intercambia libros, suma puntos</p>

        <div style={styles.tabs}>
          <button
            style={mode === 'login' ? styles.tabActive : styles.tab}
            onClick={() => setMode('login')}
          >Entrar</button>
          <button
            style={mode === 'register' ? styles.tabActive : styles.tab}
            onClick={() => setMode('register')}
          >Registrarse</button>
        </div>

        {mode === 'register' && (
          <input
            style={styles.input}
            placeholder="Nombre completo"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        )}
        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {message && <p style={styles.message}>{message}</p>}

        <button style={styles.button} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <p style={styles.footer}>♻ Economía circular de libros</p>
        
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7f4',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    border: '1px solid #d4e6d4',
    boxShadow: '0 2px 24px rgba(60,110,60,0.07)',
  },
  logo: {
    color: '#2d6a3f',
    fontSize: '24px',
    fontWeight: '500',
    letterSpacing: '3px',
    margin: 0,
    textAlign: 'center',
  },
  tagline: {
    color: '#7aaa88',
    textAlign: 'center',
    margin: 0,
    fontSize: '13px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f0f7f1',
    color: '#2d6a3f',
    border: '1px solid #c2dfc8',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tabActive: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#2d6a3f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    padding: '12px 14px',
    backgroundColor: '#f8fbf8',
    border: '1px solid #c2dfc8',
    borderRadius: '8px',
    color: '#1a3a24',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    backgroundColor: '#2d6a3f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    marginTop: '4px',
  },
  message: {
    color: '#2d6a3f',
    fontSize: '13px',
    textAlign: 'center',
    margin: 0,
  },
  footer: {
    color: '#9dbfa5',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '2px',
  }
}