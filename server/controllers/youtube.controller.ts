import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// YouTube API key from environment
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Fetch YouTube video details
export const getYouTubeVideoDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      res.status(400).json({ message: 'Video ID is required' });
      return;
    }

    if (!YOUTUBE_API_KEY) {
      // Return basic info without API call
      res.status(200).json({
        id: videoId,
        title: `YouTube Video (${videoId})`,
        duration: undefined
      });
      return;
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`
    );

    if (!response.ok) {
      logger.warn(`YouTube API request failed: ${response.status}`);
      res.status(200).json({
        id: videoId,
        title: `YouTube Video (${videoId})`,
        duration: undefined
      });
      return;
    }

    const data = await response.json();
    const video = data.items?.[0];

    if (!video) {
      res.status(404).json({ message: 'Video not found' });
      return;
    }

    res.status(200).json({
      id: videoId,
      title: video.snippet.title,
      duration: video.contentDetails?.duration,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails?.high?.url
    });
  } catch (error) {
    logger.error(`Get YouTube video details error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching YouTube video details' });
  }
};

// Fetch YouTube playlist details and videos
export const getYouTubePlaylistDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playlistId } = req.params;
    
    if (!playlistId) {
      res.status(400).json({ message: 'Playlist ID is required' });
      return;
    }

    if (!YOUTUBE_API_KEY) {
      // Return basic info without API call
      res.status(200).json({
        id: playlistId,
        title: `YouTube Playlist (${playlistId})`,
        videos: []
      });
      return;
    }

    // First, get playlist details
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&key=${YOUTUBE_API_KEY}&part=snippet`
    );

    if (!playlistResponse.ok) {
      logger.warn(`YouTube Playlist API request failed: ${playlistResponse.status}`);
      res.status(200).json({
        id: playlistId,
        title: `YouTube Playlist (${playlistId})`,
        videos: []
      });
      return;
    }

    const playlistData = await playlistResponse.json();
    const playlist = playlistData.items?.[0];

    if (!playlist) {
      res.status(404).json({ message: 'Playlist not found' });
      return;
    }

    // Then, get playlist videos
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&part=snippet&maxResults=50`
    );

    if (!videosResponse.ok) {
      logger.warn(`YouTube Playlist Videos API request failed: ${videosResponse.status}`);
      res.status(200).json({
        id: playlistId,
        title: playlist.snippet.title,
        videos: []
      });
      return;
    }

    const videosData = await videosResponse.json();
    const videos = videosData.items?.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
      thumbnail: item.snippet.thumbnails?.medium?.url
    })) || [];

    res.status(200).json({
      id: playlistId,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail: playlist.snippet.thumbnails?.high?.url,
      videos
    });
  } catch (error) {
    logger.error(`Get YouTube playlist details error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching YouTube playlist details' });
  }
};

// Test endpoint to check YouTube API status
export const testYouTubeAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!YOUTUBE_API_KEY) {
      res.status(200).json({ 
        status: 'no_api_key',
        message: 'YouTube API key not configured. Basic functionality only.' 
      });
      return;
    }

    // Test with a simple video
    const testVideoId = 'dQw4w9WgXcQ';
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${testVideoId}&key=${YOUTUBE_API_KEY}&part=snippet`
    );

    if (response.ok) {
      const data = await response.json();
      res.status(200).json({ 
        status: 'working',
        message: 'YouTube API is working correctly',
        testData: data
      });
    } else {
      res.status(200).json({ 
        status: 'api_error',
        message: `YouTube API error: ${response.status}`,
        error: await response.text()
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Error testing YouTube API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Parse YouTube URL and return video/playlist info
export const parseYouTubeUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    
    if (!url) {
      res.status(400).json({ message: 'URL is required' });
      return;
    }

    // Extract video ID
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      
      if (!YOUTUBE_API_KEY) {
        res.status(200).json({
          type: 'video',
          id: videoId,
          title: `YouTube Video (${videoId})`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`
        });
        return;
      }

      // Fetch video details
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`
      );

      if (response.ok) {
        const data = await response.json();
        const video = data.items?.[0];
        
        res.status(200).json({
          type: 'video',
          id: videoId,
          title: video?.snippet?.title || `YouTube Video (${videoId})`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnail: video?.snippet?.thumbnails?.medium?.url
        });
      } else {
        res.status(200).json({
          type: 'video',
          id: videoId,
          title: `YouTube Video (${videoId})`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`
        });
      }
      return;
    }

    // Extract playlist ID - improved pattern matching
    const playlistPatterns = [
      /(?:youtube\.com\/playlist\?list=|youtube\.com\/watch\?.*&list=)([^&\n?#]+)/,
      /youtube\.com\/embed\/videoseries\?list=([^&\n?#]+)/,
      /youtube\.com\/watch\?.*list=([^&\n?#]+)/
    ];
    
    let playlistId = null;
    for (const pattern of playlistPatterns) {
      const match = url.match(pattern);
      if (match) {
        playlistId = match[1];
        break;
      }
    }
    
    if (playlistId) {
      
      if (!YOUTUBE_API_KEY) {
        res.status(200).json({
          type: 'playlist',
          id: playlistId,
          title: `YouTube Playlist (${playlistId})`,
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`
        });
        return;
      }

      // Fetch playlist details
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&key=${YOUTUBE_API_KEY}&part=snippet`
      );

      if (response.ok) {
        const data = await response.json();
        const playlist = data.items?.[0];
        
        res.status(200).json({
          type: 'playlist',
          id: playlistId,
          title: playlist?.snippet?.title || `YouTube Playlist (${playlistId})`,
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`,
          thumbnail: playlist?.snippet?.thumbnails?.medium?.url
        });
      } else {
        res.status(200).json({
          type: 'playlist',
          id: playlistId,
          title: `YouTube Playlist (${playlistId})`,
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`
        });
      }
      return;
    }

    res.status(400).json({ message: 'Invalid YouTube URL' });
  } catch (error) {
    logger.error(`Parse YouTube URL error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error parsing YouTube URL' });
  }
}; 