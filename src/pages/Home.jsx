import { supabase } from '../lib/supabase'

export default function Home() {
  return (
    <div style={{
      backgroundColor: '#f5f7f4',
      minHeight: '100vh',
      color: '#1a3a24',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d4e6d4',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '18px', fontWeight: '500', color: '#2d6a3f', letterSpacing: '2px' }}>LIBRA</span>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f7f1',
            color: '#2d6a3f',
            border: '1px solid #c2dfc8',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px'
          }}>
          Cerrar sesión
        </button>
      </div>
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{ color: '#2d6a3f', fontWeight: '500' }}>¡Bienvenido a Libra! 🌿</h2>
        <p style={{ color: '#7aaa88' }}>Aquí irá el marketplace de libros.</p>
      </div>
    </div>
  )
}