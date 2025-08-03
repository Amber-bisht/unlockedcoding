# YouTube Integration

This document describes the YouTube video and playlist integration features added to the application.

## Features

### 1. YouTube Video Support
- Embed YouTube videos using standard YouTube URLs
- Supports various YouTube URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`

### 2. YouTube Playlist Support
- Embed entire YouTube playlists
- Automatically fetch all videos from a playlist
- Supports playlist URLs:
  - `https://www.youtube.com/playlist?list=PLAYLIST_ID`
  - `https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID`

### 3. Admin Integration
- YouTube URL parser in admin forms
- Bulk import of YouTube videos and playlists
- Automatic video title extraction (with YouTube API)

## Components

### YouTubePlayer
A React component that handles YouTube video and playlist embedding.

**Props:**
- `url`: YouTube video or playlist URL
- `title`: Optional custom title
- `className`: CSS classes
- `onVideoChange`: Callback when video changes
- `showPlaylist`: Whether to show playlist navigation

**Usage:**
```tsx
<YouTubePlayer
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  title="My Video"
  showPlaylist={true}
/>
```

### YouTubeUrlParser
A component for parsing YouTube URLs and extracting video/playlist information.

**Props:**
- `onVideosParsed`: Callback with parsed videos
- `className`: CSS classes

**Usage:**
```tsx
<YouTubeUrlParser
  onVideosParsed={(videos) => {
    console.log('Parsed videos:', videos);
  }}
/>
```

## Utilities

### youtube-utils.ts
Contains utility functions for YouTube URL parsing and API interactions.

**Key Functions:**
- `extractYouTubeVideoId(url)`: Extract video ID from URL
- `extractYouTubePlaylistId(url)`: Extract playlist ID from URL
- `isYouTubeVideo(url)`: Check if URL is a YouTube video
- `isYouTubePlaylist(url)`: Check if URL is a YouTube playlist
- `convertToYouTubeEmbed(url)`: Convert URL to embed format
- `fetchYouTubeVideoDetails(videoId, apiKey)`: Fetch video details
- `fetchYouTubePlaylistDetails(playlistId, apiKey)`: Fetch playlist details

## API Endpoints

### Server-side YouTube API

**GET /api/youtube/video/:videoId**
Fetch details for a specific YouTube video.

**GET /api/youtube/playlist/:playlistId**
Fetch details and videos for a YouTube playlist.

**POST /api/youtube/parse**
Parse a YouTube URL and return video/playlist information.

## Setup

### 1. Environment Variables
Add your YouTube Data API key to the environment:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

For client-side usage (optional):
```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 2. YouTube Data API
To get full functionality with video titles and playlist details:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your environment variables

### 3. Usage in Course Videos
The course videos page automatically detects YouTube URLs and uses the YouTube player instead of the standard video player.

## Admin Usage

### Adding YouTube Videos to Courses

1. Go to Admin → Add Course or Edit Course
2. In the "Video Links" section, use the "Add YouTube" button
3. Enter a YouTube video or playlist URL
4. The system will automatically:
   - Parse the URL
   - Extract video/playlist information
   - Add all videos to the course

### Bulk Import
You can also paste YouTube URLs directly in the bulk input field:

```
Introduction Video:https://www.youtube.com/watch?v=VIDEO_ID
Complete Course Playlist:https://www.youtube.com/playlist?list=PLAYLIST_ID
```

## Demo Page

Visit `/youtube-demo` to test the YouTube integration features.

## Supported URL Formats

### Video URLs
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/v/VIDEO_ID`

### Playlist URLs
- `https://www.youtube.com/playlist?list=PLAYLIST_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID`
- `https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID`

## Error Handling

The system gracefully handles:
- Invalid YouTube URLs
- Missing YouTube API key
- Network errors
- API rate limits
- Private/unavailable videos

When the YouTube API is not available, the system falls back to basic functionality using URL parsing.

## Limitations

1. **API Quotas**: YouTube Data API has daily quotas
2. **Private Videos**: Cannot access private or unlisted videos
3. **Playlist Size**: Limited to first 50 videos in a playlist
4. **Rate Limits**: API requests are rate-limited

## Future Enhancements

1. **Caching**: Cache video/playlist data to reduce API calls
2. **Thumbnails**: Display video thumbnails in playlists
3. **Duration**: Show video duration information
4. **Chapters**: Support for video chapters/timestamps
5. **Live Streams**: Support for YouTube live streams
6. **Multiple Platforms**: Extend to other video platforms (Vimeo, etc.) 