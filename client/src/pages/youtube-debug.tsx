import React, { useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Youtube, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { isYouTubeVideo, isYouTubePlaylist, extractYouTubeVideoId, extractYouTubePlaylistId } from '@/lib/youtube-utils';

export default function YouTubeDebugPage() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testYouTubeAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/youtube/test');
      const data = await response.json();
      setResults({ type: 'api_test', data });
    } catch (error) {
      setResults({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testURLParsing = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/youtube/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      setResults({ type: 'url_parse', data });
    } catch (error) {
      setResults({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testPlaylistExtraction = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    try {
      const playlistId = extractYouTubePlaylistId(url);
      if (playlistId) {
        const response = await fetch(`/api/youtube/playlist/${playlistId}`);
        const data = await response.json();
        setResults({ type: 'playlist_extract', data, playlistId });
      } else {
        setResults({ type: 'error', error: 'No playlist ID found in URL' });
      }
    } catch (error) {
      setResults({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">YouTube Debug Tool</h1>
            <p className="text-muted-foreground">
              Test YouTube API and URL parsing functionality
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-500" />
                  YouTube API Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={testYouTubeAPI}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Testing...' : 'Test YouTube API'}
                </Button>
              </CardContent>
            </Card>

            {/* URL Parser */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  URL Parser Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    placeholder="Enter YouTube URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={testURLParsing}
                    disabled={loading || !url.trim()}
                    className="flex-1"
                  >
                    Parse URL
                  </Button>
                  <Button 
                    onClick={testPlaylistExtraction}
                    disabled={loading || !url.trim()}
                    className="flex-1"
                  >
                    Extract Playlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {results && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.type === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* URL Analysis */}
          {url && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>URL Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>URL:</strong> {url}
                  </div>
                  <div>
                    <strong>Is YouTube Video:</strong> {isYouTubeVideo(url) ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Is YouTube Playlist:</strong> {isYouTubePlaylist(url) ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Video ID:</strong> {extractYouTubeVideoId(url) || 'None'}
                  </div>
                  <div>
                    <strong>Playlist ID:</strong> {extractYouTubePlaylistId(url) || 'None'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
} 