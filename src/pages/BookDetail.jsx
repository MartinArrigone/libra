import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CONDITIONS = { new: 'Nuevo', very_good: 'Muy bueno', good: 'Bueno', fair: 'Regular' }

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: book } = await supabase.from('books').select('*').eq('id', id).single()
    setProfile(prof)
    setBook(book)
    setIsOwner(book?.user_id === user.id)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Seguro que querés eliminar esta publicación?')) return
    await supabase.from('books').delete().eq('id', id)
    navigate('/')
  }

  if (loading) return <div style={s.loading}>Cargando...</div>
  if (!book) return <div style={s.loading}>Libro no encontrado.</div>

  const canBuy = !isOwner && profile?.points_balance >= book.points_price

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.logo}>LIBRA</span>
        <div style={s.headerRight}>
          <span style={s.points}>🌿 {profile?.points_balance ?? 0} pts</span>
          <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <div style={s.top}>
            {book.cover_url
              ? <img src={book.cover_url} alt={book.title} style={s.cover} />
              : <div style={s.noCover}>📚</div>
            }
            <div style={s.info}>
              <h1 style={s.title}>{book.title}</h1>
              <p style={s.meta}>{book.author}</p>
              <p style={s.meta}>{book.genre}</p>
              <p style={s.meta}>Idioma: {book.language}</p>

              {book.google_books_rating && (
                <div style={s.rating}>★ {book.google_books_rating} en Google Books</div>
              )}

              <div style={s.conditionBadge}>{CONDITIONS[book.condition]}</div>

              {book.description && (
                <p style={s.description}>{book.description}</p>
              )}
            </div>
          </div>

          <div style={s.footer}>
            <div style={s.ptsBox}>
              <span style={s.ptsLabel}>Valor</span>
              <span style={s.ptsValue}>{book.points_price} pts</span>
            </div>

            {isOwner ? (
              <div style={s.actions}>
                <span style={s.ownerTag}>Tu publicación</span>
                <button style={s.deleteBtn} onClick={handleDelete}>Eliminar</button>
              </div>
            ) : (
              <div style={s.actions}>
                {!canBuy && (
                  <p style={s.warning}>
                    {profile?.points_balance < book.points_price
                      ? 'No tenés suficientes puntos'
                      : ''}
                  </p>
                )}
                <button
                  style={canBuy ? s.buyBtn : s.buyBtnDisabled}
                  disabled={!canBuy}
                  onClick={() => alert('Flujo de compra próximamente')}
                >
                  Canjear por {book.points_price} pts
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', backgroundColor: '#f5f7f4', fontFamily: 'sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7aaa88', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#fff', borderBottom: '1px solid #d4e6d4', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '18px', fontWeight: '500', color: '#2d6a3f', letterSpacing: '2px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  points: { fontSize: '14px', color: '#2d6a3f', fontWeight: '500', backgroundColor: '#f0f7f1', padding: '6px 12px', borderRadius: '20px', border: '1px solid #c2dfc8' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  content: { maxWidth: '700px', margin: '0 auto', padding: '32px 24px' },
  card: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '16px', overflow: 'hidden' },
  top: { display: 'flex', gap: '24px', padding: '28px', flexWrap: 'wrap' },
  cover: { width: '140px', height: '200px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  noCover: { width: '140px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f7f1', borderRadius: '8px', fontSize: '48px', flexShrink: 0 },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  title: { fontSize: '20px', fontWeight: '500', color: '#1a3a24', margin: 0 },
  meta: { fontSize: '13px', color: '#7aaa88', margin: 0 },
  rating: { fontSize: '13px', color: '#2d6a3f', fontWeight: '500' },
  conditionBadge: { display: 'inline-block', fontSize: '12px', backgroundColor: '#f0f7f1', color: '#2d6a3f', padding: '4px 12px', borderRadius: '20px', border: '1px solid #c2dfc8', marginTop: '4px' },
  description: { fontSize: '13px', color: '#4a6a54', lineHeight: '1.6', marginTop: '8px' },
  footer: { borderTop: '1px solid #d4e6d4', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  ptsBox: { display: 'flex', flexDirection: 'column' },
  ptsLabel: { fontSize: '12px', color: '#7aaa88' },
  ptsValue: { fontSize: '28px', fontWeight: '500', color: '#2d6a3f' },
  actions: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  ownerTag: { fontSize: '13px', color: '#7aaa88' },
  deleteBtn: { padding: '10px 20px', backgroundColor: '#fff0f0', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  buyBtn: { padding: '12px 24px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  buyBtnDisabled: { padding: '12px 24px', backgroundColor: '#c2dfc8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontSize: '14px', fontWeight: '500' },
  warning: { fontSize: '12px', color: '#c0392b', margin: 0 },
}