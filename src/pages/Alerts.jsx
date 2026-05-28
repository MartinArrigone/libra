import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { searchBooks } from '../lib/googleBooks'

const GENRES = ['Fiction', 'Non-fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Horror', 'Biography', 'History', 'Science', 'Business & Economics', 'Drama', 'Education', 'Classic Literature', 'Humor', 'Children']
const LANGUAGES = ['es', 'en', 'fr', 'de', 'pt']
const CONDITIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'very_good', label: 'Muy bueno' },
  { value: 'good', label: 'Bueno' },
  { value: 'fair', label: 'Regular' },
]

export default function Alerts() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showing, setShowing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [form, setForm] = useState({
    title: '', author: '', genre: '', language: '', condition_min: '', max_points: ''
  })

  useEffect(() => { fetchAlerts() }, [])

  const fetchAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
    setAlerts(data || [])
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    const books = await searchBooks(searchQuery)
    setSearchResults(books)
    setSearching(false)
  }

  const handleSelectBook = (book) => {
    setForm({
      ...form,
      title: book.title,
      author: book.author,
      genre: book.genre !== 'Sin categoría' ? book.genre : '',
      language: book.language || '',
    })
    setSearchResults([])
    setSearchQuery('')
  }

  const handleCreate = async () => {
    if (!form.title && !form.author && !form.genre) {
      alert('Completá al menos título, autor o género')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('alerts').insert({
      user_id: user.id,
      title: form.title || null,
      author: form.author || null,
      genre: form.genre || null,
      language: form.language || null,
      condition_min: form.condition_min || null,
      max_points: form.max_points ? parseInt(form.max_points) : null,
      active: true,
    })
    setForm({ title: '', author: '', genre: '', language: '', condition_min: '', max_points: '' })
    setShowing(false)
    fetchAlerts()
  }

  const handleDelete = async (id) => {
    await supabase.from('alerts').update({ active: false }).eq('id', id)
    fetchAlerts()
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.logo}>LIBRA</span>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </div>

      <div style={s.content}>
        <div style={s.top}>
          <h2 style={s.title}>Mis alertas</h2>
          <button style={s.newBtn} onClick={() => setShowing(!showing)}>
            {showing ? 'Cancelar' : '+ Nueva alerta'}
          </button>
        </div>

        {showing && (
          <div style={s.form}>
            <p style={s.formTitle}>Avisame cuando aparezca...</p>

            <div style={s.searchRow}>
              <input
                style={s.input}
                placeholder="Buscá un libro en Google Books (opcional)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button style={s.searchBtn} onClick={handleSearch} disabled={searching}>
                {searching ? '...' : 'Buscar'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div style={s.results}>
                {searchResults.map(book => (
                  <div key={book.googleId} style={s.resultItem} onClick={() => handleSelectBook(book)}>
                    {book.cover && <img src={book.cover} alt={book.title} style={s.thumb} />}
                    <div>
                      <div style={s.bookTitle}>{book.title}</div>
                      <div style={s.bookMeta}>{book.author} · {book.genre}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input style={s.input} placeholder="Título" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <input style={s.input} placeholder="Autor" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
            <select style={s.input} value={form.genre} onChange={e => setForm({...form, genre: e.target.value})}>
              <option value="">Género (opcional)</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select style={s.input} value={form.language} onChange={e => setForm({...form, language: e.target.value})}>
              <option value="">Idioma (opcional)</option>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select style={s.input} value={form.condition_min} onChange={e => setForm({...form, condition_min: e.target.value})}>
              <option value="">Estado mínimo (opcional)</option>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input style={s.input} placeholder="Máximo de puntos (opcional)" type="number" value={form.max_points} onChange={e => setForm({...form, max_points: e.target.value})} />
            <button style={s.createBtn} onClick={handleCreate}>Crear alerta</button>
          </div>
        )}

        {loading ? (
          <p style={s.empty}>Cargando...</p>
        ) : alerts.length === 0 ? (
          <p style={s.empty}>No tenés alertas activas. Creá una para que te avisemos cuando aparezca un libro.</p>
        ) : (
          <div style={s.list}>
            {alerts.map(alert => (
              <div key={alert.id} style={s.card}>
                <div style={s.cardInfo}>
                  {alert.title && <span style={s.tag}>📖 {alert.title}</span>}
                  {alert.author && <span style={s.tag}>✍️ {alert.author}</span>}
                  {alert.genre && <span style={s.tag}>🏷️ {alert.genre}</span>}
                  {alert.language && <span style={s.tag}>🌍 {alert.language}</span>}
                  {alert.condition_min && <span style={s.tag}>⭐ Mín. {alert.condition_min}</span>}
                  {alert.max_points && <span style={s.tag}>🌿 Máx. {alert.max_points} pts</span>}
                </div>
                <button style={s.deleteBtn} onClick={() => handleDelete(alert.id)}>Eliminar</button>
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
  header: { backgroundColor: '#fff', borderBottom: '1px solid #d4e6d4', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '18px', fontWeight: '500', color: '#2d6a3f', letterSpacing: '2px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  content: { maxWidth: '700px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '22px', fontWeight: '500', color: '#1a3a24', margin: 0 },
  newBtn: { padding: '10px 18px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  form: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  formTitle: { fontSize: '15px', fontWeight: '500', color: '#1a3a24', margin: 0 },
  searchRow: { display: 'flex', gap: '8px' },
  searchBtn: { padding: '10px 16px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  results: { backgroundColor: '#f8fbf8', border: '1px solid #c2dfc8', borderRadius: '8px', overflow: 'hidden' },
  resultItem: { display: 'flex', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f0f7f1', alignItems: 'center' },
  thumb: { width: '32px', height: '45px', objectFit: 'cover', borderRadius: '3px' },
  bookTitle: { fontSize: '13px', fontWeight: '500', color: '#1a3a24' },
  bookMeta: { fontSize: '11px', color: '#7aaa88' },
  input: { padding: '10px 14px', backgroundColor: '#f8fbf8', border: '1px solid #c2dfc8', borderRadius: '8px', fontSize: '14px', color: '#1a3a24', outline: 'none' },
  createBtn: { padding: '12px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginTop: '4px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  cardInfo: { display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 },
  tag: { fontSize: '13px', backgroundColor: '#f0f7f1', color: '#2d6a3f', padding: '4px 10px', borderRadius: '20px', border: '1px solid #c2dfc8' },
  deleteBtn: { padding: '6px 14px', backgroundColor: '#fff0f0', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' },
  empty: { textAlign: 'center', color: '#7aaa88', marginTop: '40px', fontSize: '15px' },
}