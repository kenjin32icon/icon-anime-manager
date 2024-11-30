import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Typography, 
  Box,
  Chip,
  Rating,
  Button,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material'
import { 
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteIconBorder
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import type { Anime } from '../services/animeService'

interface WatchStatus {
  status: 'Planning' | 'Watching' | 'Completed' | 'On Hold' | 'Dropped'
  episodesWatched: number
  personalRating: number
  notes: string
  lastUpdated: string
}

interface AnimeDetailProps {
  anime: Anime | null
  open: boolean
  onClose: () => void
  onFavoriteToggle: (animeId: number) => void
  isFavorite: boolean
}

const WATCH_STATUS_KEY_PREFIX = 'anime_status_'

export default function AnimeDetail({ 
  anime, 
  open, 
  onClose, 
  onFavoriteToggle,
  isFavorite 
}: AnimeDetailProps) {
  const [watchStatus, setWatchStatus] = useState<WatchStatus>({
    status: 'Planning',
    episodesWatched: 0,
    personalRating: 0,
    notes: '',
    lastUpdated: new Date().toISOString()
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (anime) {
      loadWatchStatus(anime.id)
    }
  }, [anime?.id])

  const loadWatchStatus = (animeId: number) => {
    try {
      const savedStatus = localStorage.getItem(`${WATCH_STATUS_KEY_PREFIX}${animeId}`)
      if (savedStatus) {
        const parsed = JSON.parse(savedStatus)
        setWatchStatus(parsed)
      } else {
        // Reset to default if no saved status
        setWatchStatus({
          status: 'Planning',
          episodesWatched: 0,
          personalRating: 0,
          notes: '',
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error loading watch status:', error)
      setError('Failed to load watch status')
    }
  }

  const saveWatchStatus = (status: WatchStatus) => {
    if (!anime) return

    try {
      localStorage.setItem(
        `${WATCH_STATUS_KEY_PREFIX}${anime.id}`, 
        JSON.stringify({
          ...status,
          lastUpdated: new Date().toISOString()
        })
      )
    } catch (error) {
      console.error('Error saving watch status:', error)
      setError('Failed to save watch status')
    }
  }

  const handleStatusChange = (newStatus: WatchStatus['status']) => {
    const updatedStatus = { ...watchStatus, status: newStatus }
    setWatchStatus(updatedStatus)
    saveWatchStatus(updatedStatus)
  }

  const handleEpisodesChange = (episodes: string) => {
    const episodeCount = parseInt(episodes, 10)
    
    if (isNaN(episodeCount) || episodeCount < 0) {
      setError('Episodes must be a positive number')
      return
    }

    if (anime?.episodes && episodeCount > anime.episodes) {
      setError(`Episodes cannot exceed ${anime.episodes}`)
      return
    }

    const updatedStatus = { ...watchStatus, episodesWatched: episodeCount }
    setWatchStatus(updatedStatus)
    saveWatchStatus(updatedStatus)
    setError(null)
  }

  const handleRatingChange = (rating: number | null) => {
    const updatedStatus = { 
      ...watchStatus, 
      personalRating: rating || 0
    }
    setWatchStatus(updatedStatus)
    saveWatchStatus(updatedStatus)
  }

  const handleNotesChange = (notes: string) => {
    const updatedStatus = { ...watchStatus, notes }
    setWatchStatus(updatedStatus)
    saveWatchStatus(updatedStatus)
  }

  if (!anime) return null

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {anime.title}
            {anime.titleEnglish && anime.titleEnglish !== anime.title && (
              <Typography variant="subtitle1" color="text.secondary">
                {anime.titleEnglish}
              </Typography>
            )}
          </Typography>
          <Box>
            <IconButton onClick={() => onFavoriteToggle(anime.id)} color="primary">
              {isFavorite ? <FavoriteIcon /> : <FavoriteIconBorder />}
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} mb={2}>
          <Box 
            component="img" 
            src={anime.image} 
            alt={anime.title}
            sx={{ 
              width: 200, 
              height: 300, 
              objectFit: 'cover',
              borderRadius: 1
            }}
          />
          <Box flex={1}>
            <Typography variant="body1" paragraph>
              {anime.description}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
              {anime.genres?.map((genre) => (
                <Chip key={genre} label={genre} size="small" />
              ))}
            </Box>
            <Box display="flex" gap={2} alignItems="center" mb={1}>
              <Typography variant="body2">
                MAL Rating: {anime.rating || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Episodes: {anime.episodes || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Status: {anime.status || 'N/A'}
              </Typography>
            </Box>
            {anime.aired && (
              <Typography variant="body2">
                Aired: {new Date(anime.aired.from).toLocaleDateString()} 
                {anime.aired.to && ` to ${new Date(anime.aired.to).toLocaleDateString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Personal Tracking
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={watchStatus.status}
                label="Status"
                onChange={(e) => handleStatusChange(e.target.value as WatchStatus['status'])}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="Planning">Planning</MenuItem>
                <MenuItem value="Watching">Watching</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Dropped">Dropped</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <TextField
                label="Episodes Watched"
                type="number"
                value={watchStatus.episodesWatched}
                onChange={(e) => handleEpisodesChange(e.target.value)}
                inputProps={{ 
                  min: 0, 
                  max: anime.episodes || undefined
                }}
                sx={{ width: 120 }}
              />
            </FormControl>

            <Box>
              <Typography component="legend" variant="body2">
                Personal Rating
              </Typography>
              <Rating
                value={watchStatus.personalRating}
                onChange={(_, value) => handleRatingChange(value)}
                precision={0.5}
              />
            </Box>
          </Box>

          <TextField
            label="Notes"
            multiline
            rows={4}
            value={watchStatus.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>

        {anime.trailer && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Trailer
            </Typography>
            <Box
              component="iframe"
              src={anime.trailer.embed_url}
              sx={{
                width: '100%',
                height: 315,
                border: 'none',
                borderRadius: 1
              }}
              allowFullScreen
            />
          </Box>
        )}
      </DialogContent>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}