import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Purchase() {
  const navigate = useNavigate()
  const location = useLocation()
  const book = location.state?.book
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePurchase = async () => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purchase-book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ bookId: book.id, buyerId: user.id })
    })

    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setLoading(false)
    } else {
      navigate('/my-purchases')
    }
  }

  if (!book) return <div style={s.loading}>No hay libro seleccionado.</div>

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.logo}>LIBRA</span>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← Volver</button>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <h2 style={s.title}>Confirmar canje</h2>

          <div style={s.bookRow}>
            {book.cover_url
              ? <img src={book.cover_url} alt={book.title} style={s.cover} />
              : <div style={s.noCover}>📚</div>
            }
            <div style={s.bookInfo}>
              <div style={s.bookTitle}>{book.title}</div>
              <div style={s.bookMeta}>{book.author}</div>
              <div style={s.bookMeta}>{book.genre}</div>
            </div>
          </div>

          <div style={s.divider} />

          <div style={s.row}>
            <span style={s.label}>Estado</span>
            <span style={s.value}>{{ new: 'Nuevo', very_good: 'Muy bueno', good: 'Bueno', fair: 'Regular' }[book.condition]}</span>
          </div>
          <div style={s.row}>
            <span style={s.label}>Coste</span>
            <span style={s.pts}>{book.points_price} pts</span>
          </div>

          <div style={s.infoBox}>
            <p style={s.infoText}>🌿 Los puntos quedan reservados hasta que confirmes la recepción del libro. Si no confirmás en 5 días, se confirma automáticamente.</p>
          </div>

          {error && <p style={s.error}>{error}</p>}

          <div style={s.actions}>
            <button style={s.cancelBtn} onClick={() => navigate(-1)}>Cancelar</button>
            <button style={s.confirmBtn} onClick={handlePurchase} disabled={loading}>
              {loading ? 'Procesando...' : `Canjear por ${book.points_price} pts`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', backgroundColor: '#f5f7f4', fontFamily: 'sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7aaa88', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#fff', borderBottom: '1px solid #d4e6d4', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '18px', fontWeight: '500', color: '#2d6a3f', letterSpacing: '2px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  content: { maxWidth: '500px', margin: '0 auto', padding: '32px 24px' },
  card: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  title: { fontSize: '20px', fontWeight: '500', color: '#1a3a24', margin: 0 },
  bookRow: { display: 'flex', gap: '16px', alignItems: 'center' },
  cover: { width: '60px', height: '85px', objectFit: 'cover', borderRadius: '6px' },
  noCover: { width: '60px', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f7f1', borderRadius: '6px', fontSize: '28px' },
  bookInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  bookTitle: { fontSize: '15px', fontWeight: '500', color: '#1a3a24' },
  bookMeta: { fontSize: '12px', color: '#7aaa88' },
  divider: { borderTop: '1px solid #d4e6d4' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '13px', color: '#7aaa88' },
  value: { fontSize: '13px', color: '#1a3a24' },
  pts: { fontSize: '20px', fontWeight: '500', color: '#2d6a3f' },
  infoBox: { backgroundColor: '#f0f7f1', border: '1px solid #c2dfc8', borderRadius: '8px', padding: '12px 16px' },
  infoText: { fontSize: '13px', color: '#2d6a3f', margin: 0, lineHeight: '1.5' },
  error: { color: '#c0392b', fontSize: '13px', margin: 0, textAlign: 'center' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  confirmBtn: { padding: '10px 24px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
}