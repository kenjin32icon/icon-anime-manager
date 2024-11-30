import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme,
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { Anime } from '../services/animeService'

interface StatsDashboardProps {
  favorites: Anime[]
}

export default function StatsDashboard({ favorites }: StatsDashboardProps) {
  const theme = useTheme()

  // Calculate genre distribution
  const getGenreDistribution = () => {
    const genreCounts: { [key: string]: number } = {}
    favorites.forEach(anime => {
      anime.genres?.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
      })
    })
    return Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 genres
  }

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const ratings = favorites.reduce((acc: { [key: string]: number }, anime) => {
      const rating = Math.floor(anime.rating || 0)
      const ratingRange = `${rating}-${rating + 1}`
      acc[ratingRange] = (acc[ratingRange] || 0) + 1
      return acc
    }, {})
    return Object.entries(ratings)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  // Calculate status distribution
  const getStatusDistribution = () => {
    const statusCounts = favorites.reduce((acc: { [key: string]: number }, anime) => {
      const status = anime.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  const genreData = getGenreDistribution()
  const ratingData = getRatingDistribution()
  const statusData = getStatusDistribution()

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Anime Statistics Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Favorites</Typography>
            <Typography variant="h4">{favorites.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Average Rating</Typography>
            <Typography variant="h4">
              {(favorites.reduce((sum, anime) => sum + (anime.rating || 0), 0) / favorites.length || 0).toFixed(1)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Most Common Genre</Typography>
            <Typography variant="h4">{genreData[0]?.name || 'N/A'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Completion Rate</Typography>
            <Typography variant="h4">
              {Math.round((statusData.find(s => s.name === 'Completed')?.value || 0) / favorites.length * 100)}%
            </Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Top Genres</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genreData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Rating Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Watch Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}