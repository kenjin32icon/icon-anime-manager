import axios, { AxiosError } from 'axios'

// Types
export interface Anime {
  id: number
  title: string
  titleEnglish?: string
  titleJapanese?: string
  image: string
  description: string
  rating?: number
  episodes?: number
  genres?: string[]
  status?: string
  aired?: {
    from: string
    to: string | null
  }
  duration?: string
  source?: string
  type?: string
  popularity?: number
  members?: number
  trailer?: {
    url: string
    embed_url: string
  }
}

export class AnimeServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'AnimeServiceError'
  }
}

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
const CACHE_PREFIX = 'anime_cache_'
interface CacheEntry<T> {
  timestamp: number
  data: T
}

// Local Storage Keys
const FAVORITES_KEY = 'anime_favorites'
const WATCH_STATUS_PREFIX = 'anime_status_'

// Jikan API (Free MyAnimeList API)
const API_BASE_URL = 'https://api.jikan.moe/v4'
const API_RATE_LIMIT = 1000 // 1 second between requests

let lastRequestTime = 0

// Helper Functions
async function handleApiRequest<T>(url: string, params?: Record<string, any>): Promise<T> {
  try {
    // Rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime
    if (timeSinceLastRequest < API_RATE_LIMIT) {
      await new Promise(resolve => setTimeout(resolve, API_RATE_LIMIT - timeSinceLastRequest))
    }
    lastRequestTime = Date.now()

    const response = await axios.get(url, { params })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 429) {
        throw new AnimeServiceError('Rate limit exceeded. Please try again later.', 'RATE_LIMIT')
      }
      throw new AnimeServiceError(
        axiosError.response?.data?.message || 'Failed to fetch data from API',
        'API_ERROR',
        error
      )
    }
    throw new AnimeServiceError('An unexpected error occurred', 'UNKNOWN', error as Error)
  }
}

function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`
}

function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(getCacheKey(key))
    if (!cached) return null

    const entry: CacheEntry<T> = JSON.parse(cached)
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(getCacheKey(key))
      return null
    }

    return entry.data
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      timestamp: Date.now(),
      data
    }
    localStorage.setItem(getCacheKey(key), JSON.stringify(entry))
  } catch (error) {
    console.error('Error writing to cache:', error)
  }
}

// API Functions
export async function searchAnime(query: string): Promise<Anime[]> {
  const cacheKey = `search_${query}`
  const cached = getFromCache<Anime[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await handleApiRequest<any>(`${API_BASE_URL}/anime`, {
      q: query,
      limit: 20,
      sfw: true
    })

    const animes = response.data.map(mapAnimeResponse)
    setCache(cacheKey, animes)
    return animes
  } catch (error) {
    if (error instanceof AnimeServiceError) throw error
    throw new AnimeServiceError('Failed to search anime', 'SEARCH_ERROR', error as Error)
  }
}

export async function getAnimeDetails(id: number): Promise<Anime | null> {
  const cacheKey = `details_${id}`
  const cached = getFromCache<Anime>(cacheKey)
  if (cached) return cached

  try {
    const response = await handleApiRequest<any>(`${API_BASE_URL}/anime/${id}`)
    const anime = mapAnimeResponse(response.data)
    setCache(cacheKey, anime)
    return anime
  } catch (error) {
    if (error instanceof AnimeServiceError) throw error
    throw new AnimeServiceError('Failed to fetch anime details', 'DETAILS_ERROR', error as Error)
  }
}

// Mapping function to ensure consistent data structure
function mapAnimeResponse(item: any): Anime {
  return {
    id: item.mal_id,
    title: item.title,
    titleEnglish: item.title_english,
    titleJapanese: item.title_japanese,
    image: item.images.jpg.image_url,
    description: item.synopsis,
    rating: item.score,
    episodes: item.episodes,
    genres: item.genres?.map((g: any) => g.name),
    status: item.status,
    aired: item.aired,
    duration: item.duration,
    source: item.source,
    type: item.type,
    popularity: item.popularity,
    members: item.members,
    trailer: item.trailer
  }
}

// Favorites Management with error handling
export function getFavorites(): number[] {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY)
    return favorites ? JSON.parse(favorites) : []
  } catch (error) {
    console.error('Error reading favorites:', error)
    return []
  }
}

export function addToFavorites(animeId: number): void {
  try {
    const favorites = getFavorites()
    if (!favorites.includes(animeId)) {
      favorites.push(animeId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
  } catch (error) {
    throw new AnimeServiceError('Failed to add to favorites', 'FAVORITES_ERROR', error as Error)
  }
}

export function removeFromFavorites(animeId: number): void {
  try {
    const favorites = getFavorites()
    const updatedFavorites = favorites.filter(id => id !== animeId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
  } catch (error) {
    throw new AnimeServiceError('Failed to remove from favorites', 'FAVORITES_ERROR', error as Error)
  }
}

export function isFavorite(animeId: number): boolean {
  try {
    const favorites = getFavorites()
    return favorites.includes(animeId)
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return false
  }
}

// Get Top Anime
export async function getTopAnime(): Promise<Anime[]> {
  const cacheKey = 'top_anime'
  const cached = getFromCache<Anime[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await handleApiRequest<any>(`${API_BASE_URL}/top/anime`, {
      limit: 20,
      sfw: true
    })

    const animes = response.data.map(mapAnimeResponse)
    setCache(cacheKey, animes)
    return animes
  } catch (error) {
    if (error instanceof AnimeServiceError) throw error
    throw new AnimeServiceError('Failed to fetch top anime', 'TOP_ANIME_ERROR', error as Error)
  }
}