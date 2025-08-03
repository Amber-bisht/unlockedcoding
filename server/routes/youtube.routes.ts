import { Router } from 'express';
import { 
  getYouTubeVideoDetails, 
  getYouTubePlaylistDetails, 
  parseYouTubeUrl,
  testYouTubeAPI
} from '../controllers/youtube.controller';

const router = Router();

// Get YouTube video details
router.get('/video/:videoId', getYouTubeVideoDetails);

// Get YouTube playlist details
router.get('/playlist/:playlistId', getYouTubePlaylistDetails);

// Test YouTube API status
router.get('/test', testYouTubeAPI);

// Parse YouTube URL and return video/playlist info
router.post('/parse', parseYouTubeUrl);

export default router; 