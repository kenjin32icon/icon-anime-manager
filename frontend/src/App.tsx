import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert
} from '@mui/material'
import { Search as SearchIcon, Favorite as FavoriteIcon, BarChart as StatsIcon } from '@mui/icons-material'
import { IconButton, InputBase } from '@mui/material'
import AnimeGrid from './components/AnimeGrid'
import AnimeDetail from './components/AnimeDetail'
import FilterBar, { SortOption, AnimeStatus } from './components/FilterBar'
import StatsDashboard from './components/StatsDashboard'
import * as animeService from './services/animeService'
import type { Anime } from './services/animeService'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
})

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'stats'>('all')
  
  // Filter states
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [status, setStatus] = useState<AnimeStatus>('all')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  // Load initial data
  useEffect(() => {
    loadTopAnime()
  }, [])

  // Search effect
  useEffect(() => {
    if (searchQuery) {
      const delayDebounceFn = setTimeout(() => {
        searchAnimes(searchQuery)
      }, 500)
      return () => clearTimeout(delayDebounceFn)
    } else {
      loadTopAnime()
    }
  }, [searchQuery])

  const loadTopAnime = async () => {
    setLoading(true)
    setError(null)
    try {
      const topAnime = await animeService.getTopAnime()
      setAnimes(topAnime)
    } catch (err) {
      setError('Failed to load top anime')
    } finally {
      setLoading(false)
    }
  }

  const searchAnimes = async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const results = await animeService.searchAnime(query)
      setAnimes(results)
    } catch (err) {
      setError('Failed to search anime')
    } finally {
      setLoading(false)
    }
  }

  const handleAnimeClick = async (anime: Anime) => {
    try {
      const details = await animeService.getAnimeDetails(anime.id)
      if (details) {
        setSelectedAnime(details)
      }
    } catch (err) {
      setError('Failed to load anime details')
    }
  }

  const handleFavoriteToggle = (animeId: number) => {
    if (animeService.isFavorite(animeId)) {
      animeService.removeFromFavorites(animeId)
    } else {
      animeService.addToFavorites(animeId)
    }
    setAnimes([...animes])
  }

  // Apply filters and sorting
  const getFilteredAndSortedAnimes = () => {
    let filtered = viewMode === 'favorites'
      ? animes.filter(anime => animeService.isFavorite(anime.id))
      : animes

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(anime => anime.status?.toLowerCase() === status)
    }

    // Apply genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(anime => 
        anime.genres?.some(genre => selectedGenres.includes(genre))
      )
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'newest':
          return b.id - a.id
        default:
          return 0
      }
    })
  }

  const filteredAndSortedAnimes = getFilteredAndSortedAnimes()

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Anime Manager
            </Typography>
            <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, mr: 2 }}
              onSubmit={(e) => e.preventDefault()}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <IconButton type="button" sx={{ p: '10px' }}>
                <SearchIcon />
              </IconButton>
            </Paper>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              aria-label="view mode"
            >
              <ToggleButton value="all" aria-label="all anime">
                All
              </ToggleButton>
              <ToggleButton value="favorites" aria-label="favorites">
                <FavoriteIcon sx={{ mr: 1 }} />
                Favorites
              </ToggleButton>
              <ToggleButton value="stats" aria-label="statistics">
                <StatsIcon sx={{ mr: 1 }} />
                Stats
              </ToggleButton>
            </ToggleButtonGroup>
          </Toolbar>
        </AppBar>
        
        <Container sx={{ flexGrow: 1, py: 3, overflowY: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {viewMode === 'stats' ? (
            <StatsDashboard
              favorites={animes.filter(anime => animeService.isFavorite(anime.id))}
            />
          ) : (
            <>
              <FilterBar
                sort={sortBy}
                onSortChange={setSortBy}
                status={status}
                onStatusChange={setStatus}
                selectedGenres={selectedGenres}
                onGenresChange={setSelectedGenres}
              />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <AnimeGrid 
                  animes={filteredAndSortedAnimes}
                  onAnimeClick={handleAnimeClick}
                />
              )}
            </>
          )}
        </Container>

        <AnimeDetail
          anime={selectedAnime}
          open={!!selectedAnime}
          onClose={() => setSelectedAnime(null)}
          onFavoriteToggle={handleFavoriteToggle}
          isFavorite={selectedAnime ? animeService.isFavorite(selectedAnime.id) : false}
        />
      </Box>
    </ThemeProvider>
  )
}

export default App
