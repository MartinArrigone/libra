const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

export async function searchBooks(query) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${API_KEY}`
  )
  const data = await res.json()
  if (!data.items) return []

  return data.items.map(item => ({
    googleId: item.id,
    title: item.volumeInfo.title || 'Sin título',
    author: item.volumeInfo.authors?.[0] || 'Autor desconocido',
    genre: item.volumeInfo.categories?.[0] || 'Sin categoría',
    language: item.volumeInfo.language || 'desconocido',
    cover: item.volumeInfo.imageLinks?.thumbnail || null,
    rating: item.volumeInfo.averageRating || null,
    isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || null,
    description: item.volumeInfo.description || ''
  }))
}

export function calculatePoints(rating, condition) {
  if (!rating) return 3
  const base = Math.floor(rating * 2)
  const multipliers = { new: 1.0, very_good: 0.85, good: 0.70, fair: 0.50 }
  return Math.max(1, Math.round(base * (multipliers[condition] || 0.7)))
}