import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const GENRES = ['Todos', 'Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Horror', 'Biography', 'History', 'Science', 'Business & Economics', 'Drama', 'Education', 'Classic Literature', 'Humor', 'Children']
const LANGUAGES = ['Todos', 'es', 'en', 'fr', 'de', 'pt']
const CONDITIONS = { new: 'Nuevo', very_good: 'Muy bueno', good: 'Bueno', fair: 'Regular' }

export default function Home() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('Todos')
  const [language, setLanguage] = useState('Todos')
  const [profile, setProfile] = useState(null)
  const [hasSubscription, setHasSubscription] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchBooks()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  setHasSubscription(!!sub)
  }

  const fetchBooks = async () => {
    setLoading(true)
    const { data } = await supabase.from('books').select('*').eq('status', 'available').order('created_at', { ascending: false })
    setBooks(data || [])
    setLoading(false)
  }

  const filtered = books.filter(b => {
    const matchSearch = search === '' ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
    const matchGenre = genre === 'Todos' || b.genre === genre
    const matchLang = language === 'Todos' || b.language === language
    return matchSearch && matchGenre && matchLang
  })

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.logo}>LIBRA</span>
        <div style={s.headerRight}>
          <span style={s.points} onClick={() => navigate('/buy-points')} title="Comprar puntos">🌿 {profile?.points_balance ?? 0} pts</span>
          <button style={s.myBtn} onClick={() => navigate('/my-purchases')}>Mis compras</button>
          <button style={s.myBtn} onClick={() => navigate('/alerts')}>🔔 Alertas</button>
          <button style={s.publishBtn} onClick={() => navigate('/publish')}>+ Publicar libro</button>
          <button style={s.outBtn} onClick={() => supabase.auth.signOut()}>Salir</button>
        </div>
      </div>

      <div style={s.content}>
        {!hasSubscription && (
          <div style={s.banner}>
            <span>🌿 Activá tu suscripción anual para empezar a intercambiar libros</span>
            <button style={s.bannerBtn} onClick={() => navigate('/subscribe')}>
              Suscribirme — 20€/año
            </button>
          </div>
        )}
        <div style={s.filters}>
          <input
            style={s.search}
            placeholder="Buscar por título o autor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={s.select} value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="Todos" disabled>Género</option>
            {GENRES.filter(g => g !== 'Todos').map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select style={s.select} value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="Todos" disabled>Idioma</option>
            {LANGUAGES.filter(l => l !== 'Todos').map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {loading ? (
          <p style={s.empty}>Cargando libros...</p>
        ) : filtered.length === 0 ? (
          <p style={s.empty}>No hay libros disponibles.</p>
        ) : (
          <div style={s.grid}>
            {filtered.map(book => (
              <div key={book.id} style={s.card} onClick={() => navigate(`/book/${book.id}`)}>
                {book.cover_url
                  ? <img src={book.cover_url} alt={book.title} style={s.cover} />
                  : <div style={s.noCover}>📚</div>
                }
                <div style={s.cardBody}>
                  <div style={s.cardTitle}>{book.title}</div>
                  <div style={s.cardMeta}>{book.author}</div>
                  <div style={s.cardMeta}>{book.genre}</div>
                  <div style={s.cardFooter}>
                    <span style={s.condition}>{CONDITIONS[book.condition]}</span>
                    <span style={s.pts}>{book.points_price} pts</span>
                  </div>
                  {book.google_books_rating && (
                    <div style={s.rating}>★ {book.google_books_rating}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  container: { minHeight: '100vh', backgroundColor: '#f5f7f4', fontFamily: 'sans-serif' },
  header: { backgroundColor: '#fff', borderBottom: '1px solid #d4e6d4', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '18px', fontWeight: '500', color: '#2d6a3f', letterSpacing: '2px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  points: { fontSize: '14px', color: '#2d6a3f', fontWeight: '500', backgroundColor: '#f0f7f1', padding: '6px 12px', borderRadius: '20px', border: '1px solid #c2dfc8', cursor: 'pointer' },
  publishBtn: { padding: '8px 16px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  outBtn: { padding: '8px 16px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  content: { maxWidth: '1100px', margin: '0 auto', padding: '24px' },
  filters: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  search: { flex: 1, minWidth: '200px', padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #c2dfc8', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#1a3a24' },
  select: { padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #c2dfc8', borderRadius: '8px', fontSize: '14px', color: '#2d6a3f', outline: 'none', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' },
  card: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' },
  cover: { width: '100%', height: '200px', objectFit: 'cover' },
  noCover: { width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f7f1', fontSize: '40px' },
  cardBody: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  cardTitle: { fontSize: '13px', fontWeight: '500', color: '#1a3a24', lineHeight: '1.3' },
  cardMeta: { fontSize: '11px', color: '#7aaa88' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  condition: { fontSize: '11px', backgroundColor: '#f0f7f1', color: '#2d6a3f', padding: '2px 8px', borderRadius: '20px', border: '1px solid #c2dfc8' },
  pts: { fontSize: '14px', fontWeight: '500', color: '#2d6a3f' },
  rating: { fontSize: '11px', color: '#7aaa88', marginTop: '2px' },
  empty: { textAlign: 'center', color: '#7aaa88', marginTop: '60px', fontSize: '15px' },
  banner: { backgroundColor: '#f0f7f1', border: '1px solid #c2dfc8', borderRadius: '10px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '14px', color: '#2d6a3f', flexWrap: 'wrap', gap: '12px' },
  bannerBtn: { padding: '8px 18px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' },
  myBtn: { padding: '8px 16px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
}