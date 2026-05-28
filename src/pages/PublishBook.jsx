import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBooks, calculatePoints } from '../lib/googleBooks'
import { supabase } from '../lib/supabase'

const CONDITIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'very_good', label: 'Muy bueno' },
  { value: 'good', label: 'Bueno' },
  { value: 'fair', label: 'Regular' },
]

export default function PublishBook() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [condition, setCondition] = useState('good')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    const books = await searchBooks(query)
    setResults(books)
    setSearching(false)
  }

  const handleSelect = (book) => {
    setSelected(book)
    setResults([])
    setQuery('')
  }

  const handlePublish = async () => {
    if (!selected) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const points = calculatePoints(selected.rating, condition)

    const { error } = await supabase.from('books').insert({
      user_id: user.id,
      isbn: selected.isbn,
      title: selected.title,
      author: selected.author,
      genre: selected.genre,
      language: selected.language,
      condition,
      points_price: points,
      cover_url: selected.cover,
      description,
      google_books_rating: selected.rating,
      status: 'available'
    })

    if (error) setMessage('Error al publicar: ' + error.message)
    else navigate('/')

    setLoading(false)
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={s.logo}>LIBRA</span>
        <button style={s.backBtn} onClick={() => navigate('/')}>← Volver</button>
      </div>

      <div style={s.content}>
        <h2 style={s.title}>Publicar un libro</h2>

        {!selected && (
          <>
            <div style={s.searchRow}>
              <input
                style={s.input}
                placeholder="Buscá por título, autor o ISBN..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button style={s.searchBtn} onClick={handleSearch} disabled={searching}>
                {searching ? '...' : 'Buscar'}
              </button>
            </div>

            {results.length > 0 && (
              <div style={s.results}>
                {results.map(book => (
                  <div key={book.googleId} style={s.resultItem} onClick={() => handleSelect(book)}>
                    {book.cover && <img src={book.cover} alt={book.title} style={s.thumb} />}
                    <div>
                      <div style={s.bookTitle}>{book.title}</div>
                      <div style={s.bookMeta}>{book.author} · {book.genre}</div>
                      {book.rating && <div style={s.rating}>★ {book.rating}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selected && (
          <div style={s.selectedCard}>
            <div style={s.selectedInfo}>
              {selected.cover && <img src={selected.cover} alt={selected.title} style={s.cover} />}
              <div>
                <div style={s.bookTitle}>{selected.title}</div>
                <div style={s.bookMeta}>{selected.author}</div>
                <div style={s.bookMeta}>{selected.genre}</div>
                {selected.rating && <div style={s.rating}>★ {selected.rating} en Google Books</div>}
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Estado del libro</label>
              <div style={s.conditionRow}>
                {CONDITIONS.map(c => (
                  <button
                    key={c.value}
                    style={condition === c.value ? s.condActive : s.cond}
                    onClick={() => setCondition(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.pointsBox}>
              <span style={s.pointsLabel}>Valor en puntos</span>
              <span style={s.pointsValue}>{calculatePoints(selected.rating, condition)} pts</span>
            </div>

            <div style={s.field}>
              <label style={s.label}>Descripción adicional (opcional)</label>
              <textarea
                style={s.textarea}
                placeholder="Ej: Sin marcas, lomo perfecto..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {message && <p style={s.error}>{message}</p>}

            <div style={s.actions}>
              <button style={s.cancelBtn} onClick={() => setSelected(null)}>Cambiar libro</button>
              <button style={s.publishBtn} onClick={handlePublish} disabled={loading}>
                {loading ? 'Publicando...' : 'Publicar libro'}
              </button>
            </div>
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
  content: { maxWidth: '600px', margin: '0 auto', padding: '32px 24px' },
  title: { color: '#2d6a3f', fontWeight: '500', marginBottom: '24px' },
  searchRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  input: { flex: 1, padding: '12px 14px', backgroundColor: '#fff', border: '1px solid #c2dfc8', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#1a3a24' },
  searchBtn: { padding: '12px 20px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  results: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '12px', overflow: 'hidden' },
  resultItem: { display: 'flex', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f7f1', alignItems: 'center' },
  thumb: { width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' },
  bookTitle: { fontSize: '14px', fontWeight: '500', color: '#1a3a24' },
  bookMeta: { fontSize: '12px', color: '#7aaa88', marginTop: '2px' },
  rating: { fontSize: '12px', color: '#2d6a3f', marginTop: '4px', fontWeight: '500' },
  selectedCard: { backgroundColor: '#fff', border: '1px solid #d4e6d4', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  selectedInfo: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  cover: { width: '60px', height: '85px', objectFit: 'cover', borderRadius: '6px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', color: '#7aaa88', fontWeight: '500' },
  conditionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  cond: { padding: '8px 14px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  condActive: { padding: '8px 14px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  pointsBox: { backgroundColor: '#f0f7f1', border: '1px solid #c2dfc8', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pointsLabel: { fontSize: '14px', color: '#7aaa88' },
  pointsValue: { fontSize: '22px', fontWeight: '500', color: '#2d6a3f' },
  textarea: { padding: '12px 14px', backgroundColor: '#f8fbf8', border: '1px solid #c2dfc8', borderRadius: '8px', fontSize: '14px', color: '#1a3a24', outline: 'none', resize: 'vertical', fontFamily: 'sans-serif' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f0f7f1', color: '#2d6a3f', border: '1px solid #c2dfc8', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  publishBtn: { padding: '10px 24px', backgroundColor: '#2d6a3f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  error: { color: '#c0392b', fontSize: '13px', margin: 0 },
}