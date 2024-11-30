import {
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  TextField,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Clear as ClearIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { useState, useCallback } from 'react'

// Complete list of MyAnimeList genres
const GENRES = [
  'Action', 'Adventure', 'Avant Garde', 'Award Winning', 'Boys Love',
  'Comedy', 'Drama', 'Fantasy', 'Girls Love', 'Gourmet',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Suspense', 'Ecchi', 'Erotica',
  'Hentai', 'Adult'
].sort()

export type SortOption = 'rating' | 'title' | 'newest' | 'popularity' | 'episodes'
export type AnimeStatus = 'all' | 'airing' | 'completed' | 'upcoming' | 'on_hold' | 'dropped'
export type AnimeType = 'all' | 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music'
export type AnimeRating = 'all' | 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx'

interface FilterBarProps {
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  status: AnimeStatus
  onStatusChange: (status: AnimeStatus) => void
  selectedGenres: string[]
  onGenresChange: (genres: string[]) => void
  type: AnimeType
  onTypeChange: (type: AnimeType) => void
  rating: AnimeRating
  onRatingChange: (rating: AnimeRating) => void
  search: string
  onSearchChange: (search: string) => void
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'rating', label: 'Rating (High to Low)' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'newest', label: 'Release Date (Newest)' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'episodes', label: 'Episodes (Most)' },
]

const STATUS_OPTIONS: Array<{ value: AnimeStatus; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: 'airing', label: 'Currently Airing' },
  { value: 'completed', label: 'Completed' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
]

const TYPE_OPTIONS: Array<{ value: AnimeType; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'tv', label: 'TV Series' },
  { value: 'movie', label: 'Movie' },
  { value: 'ova', label: 'OVA' },
  { value: 'special', label: 'Special' },
  { value: 'ona', label: 'ONA' },
  { value: 'music', label: 'Music' },
]

const RATING_OPTIONS: Array<{ value: AnimeRating; label: string }> = [
  { value: 'all', label: 'All Ages' },
  { value: 'g', label: 'G - All Ages' },
  { value: 'pg', label: 'PG - Children' },
  { value: 'pg13', label: 'PG-13 - Teens 13+' },
  { value: 'r17', label: 'R - 17+' },
  { value: 'r', label: 'R+ - Mild Nudity' },
  { value: 'rx', label: 'Rx - Hentai' },
]

export default function FilterBar({
  sort,
  onSortChange,
  status,
  onStatusChange,
  selectedGenres,
  onGenresChange,
  type,
  onTypeChange,
  rating,
  onRatingChange,
  search,
  onSearchChange,
}: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(search)

  const handleGenreChange = useCallback((event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    onGenresChange(typeof value === 'string' ? value.split(',') : value)
  }, [onGenresChange])

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    const timeoutId = setTimeout(() => {
      onSearchChange(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [onSearchChange])

  const handleClearFilters = useCallback(() => {
    onSortChange('rating')
    onStatusChange('all')
    onGenresChange([])
    onTypeChange('all')
    onRatingChange('all')
    onSearchChange('')
    setSearchInput('')
  }, [onSortChange, onStatusChange, onGenresChange, onTypeChange, onRatingChange, onSearchChange])

  const hasActiveFilters = selectedGenres.length > 0 || 
    status !== 'all' || 
    type !== 'all' || 
    rating !== 'all' ||
    search !== ''

  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2 
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <FilterIcon color="action" />
        <Typography variant="subtitle1" fontWeight="medium">
          Filters
        </Typography>
        {hasActiveFilters && (
          <Tooltip title="Clear all filters">
            <IconButton 
              size="small" 
              onClick={handleClearFilters}
              sx={{ ml: 'auto' }}
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          size="small"
          label="Search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sort}
            label="Sort By"
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
          >
            {SORT_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => onStatusChange(e.target.value as AnimeStatus)}
          >
            {STATUS_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={(e) => onTypeChange(e.target.value as AnimeType)}
          >
            {TYPE_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Rating</InputLabel>
          <Select
            value={rating}
            label="Rating"
            onChange={(e) => onRatingChange(e.target.value as AnimeRating)}
          >
            {RATING_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 250, maxWidth: 400 }}>
          <InputLabel>Genres</InputLabel>
          <Select
            multiple
            value={selectedGenres}
            onChange={handleGenreChange}
            input={<OutlinedInput label="Genres" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={value} 
                    size="small"
                    onDelete={() => {
                      onGenresChange(selectedGenres.filter(g => g !== value))
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ))}
              </Box>
            )}
          >
            {GENRES.map((genre) => (
              <MenuItem 
                key={genre} 
                value={genre}
                sx={{ 
                  opacity: selectedGenres.includes(genre) ? 0.5 : 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                {genre}
                {selectedGenres.includes(genre) && (
                  <Chip 
                    size="small" 
                    label="Selected" 
                    color="primary" 
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  )
}