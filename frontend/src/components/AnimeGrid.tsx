import { Grid, Card, CardContent, CardMedia, Typography, CardActionArea, Box, Rating, Chip } from '@mui/material'
import type { Anime } from '../services/animeService'

interface AnimeGridProps {
  animes: Anime[]
  onAnimeClick?: (anime: Anime) => void
}

export default function AnimeGrid({ animes, onAnimeClick }: AnimeGridProps) {
  return (
    <Grid container spacing={3} padding={2}>
      {animes.map((anime) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={anime.id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            <CardActionArea onClick={() => onAnimeClick?.(anime)}>
              <CardMedia
                component="img"
                height="200"
                image={anime.image}
                alt={anime.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {anime.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={anime.rating ? anime.rating / 2 : 0} precision={0.5} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({anime.rating?.toFixed(1) || 'N/A'})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {anime.genres?.slice(0, 3).map((genre) => (
                    <Chip key={genre} label={genre} size="small" variant="outlined" />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {anime.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}