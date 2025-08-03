import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Copy, Check, PlayCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Hls from 'hls.js';
import { useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, Star as StarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { isYouTubeVideo, isYouTubePlaylist } from "@/lib/youtube-utils";

export default function CourseVideosPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get course ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  console.log('courseId:', courseId); // Debug log

  if (!courseId) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">No course ID provided in the URL.</h1>
              <p className="mb-4">Please access this page with a valid course ID, e.g. <code>?id=YOUR_COURSE_ID</code></p>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      return res.json();
    },
    enabled: !!courseId,
  });

  const videoLinks = course?.videoLinks || [];
  const currentVideo = videoLinks[currentVideoIndex];

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Video link copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyAllVideos = async () => {
    if (!course?.videoLinks) return;
    
    const videoText = course.videoLinks
      .map((link: { title: string; url: string }) => `${link.title}:${link.url}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(videoText);
      toast({
        title: "Copied!",
        description: "All video links copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!currentVideo || !videoRef.current) return;
    const video = videoRef.current;
    if (currentVideo.url.endsWith('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentVideo.url;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(currentVideo.url);
        hls.attachMedia(video);
        return () => {
          hls.destroy();
        };
      }
    } else {
      video.src = currentVideo.url;
    }
  }, [currentVideo]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Course not found</h1>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Fetch reviews for this course
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: [`/api/courses/${courseId}/reviews`],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/reviews`);
      return res.json();
    },
    enabled: !!courseId,
  });
  const { user } = useAuth();
  // Add local state for userReview
  const [localUserReview, setLocalUserReview] = useState(null);
  const userReview = localUserReview || reviews.find((r: any) => (r.userId?._id || r.userId) === user?._id);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/reviews`, {
        rating,
      });
      if (!res.ok) throw await res.json();
      return await res.json();
    },
    onSuccess: (data) => {
      setLocalUserReview(data); // Optimistically set userReview
      refetchReviews();
      setRating(0);
      toast({ title: "Thank you!", description: "Your rating has been submitted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to submit rating", variant: "destructive" });
    },
  });

  // Pagination state for comments
  const [commentsPage, setCommentsPage] = useState(1);
  const COMMENTS_PAGE_SIZE = 10;
  const { data: commentsData = [], refetch: refetchComments, isFetching: isFetchingComments } = useQuery({
    queryKey: [`/api/courses/${courseId}/comments`, commentsPage],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/courses/${courseId}/comments?page=${commentsPage}&limit=${COMMENTS_PAGE_SIZE}`);
      return await res.json();
    },
    enabled: !!courseId,
  });
  const comments = commentsData;
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/comments`, { content });
      if (!res.ok) throw await res.json();
      return await res.json();
    },
    onSuccess: () => {
      refetchComments();
      setComment("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.error || "Failed to add comment", variant: "destructive" });
    },
  });
  const [comment, setComment] = useState("");
  const userComments = comments.filter((c: any) => c.user?._id === user?._id);
  const canComment = course?.enrollment?.enrolled && userComments.length < 5;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 py-0">
        <div className="w-full flex flex-col md:flex-row h-auto md:h-[calc(100vh-64px)]">
          {/* Left: Video Player Full Height/Width */}
          <div className="w-full md:flex-1 bg-black flex flex-col justify-between relative">
            {videoLinks.length > 0 && (
              <>
                {/* Overlay Title/URL */}
                <div className="absolute top-0 left-0 w-full z-10 p-6 bg-gradient-to-b from-black/90 to-transparent">
                  <h2 className="text-3xl font-bold text-white mb-1">{currentVideo?.title}</h2>
                </div>
                <div className="w-full aspect-video mb-4">
                  {currentVideo && (isYouTubeVideo(currentVideo.url) || isYouTubePlaylist(currentVideo.url)) ? (
                    <YouTubePlayer
                      url={currentVideo.url}
                      title={currentVideo.title}
                      className="w-full h-full"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      controls
                      style={{ width: '100%', height: '100%' }}
                      poster={course.imageUrl}
                      className="bg-black w-full h-full"
                    />
                  )}
                </div>
                <div className="flex justify-between px-6 pb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentVideoIndex(i => Math.max(i - 1, 0))}
                    disabled={currentVideoIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentVideoIndex(i => Math.min(i + 1, videoLinks.length - 1))}
                    disabled={currentVideoIndex === videoLinks.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
          {/* Right: Video Titles List */}
          <aside className="w-full md:w-80 bg-[#181c24] border-l border-border h-auto md:h-full flex flex-col shadow-lg mt-4 md:mt-0">
            <div className="px-6 pt-6 pb-2 border-b border-border">
              <h2 className="text-xl font-bold text-primary mb-2">Videos</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-4">
              <ul className="space-y-2">
                {videoLinks.map((video: { title: string; url: string }, idx: number) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors border-l-4 ${
                      idx === currentVideoIndex
                        ? 'bg-primary/90 text-primary-foreground border-primary font-semibold shadow'
                        : 'hover:bg-muted border-transparent'
                    }`}
                    onClick={() => setCurrentVideoIndex(idx)}
                  >
                    <PlayCircle className={`h-5 w-5 ${idx === currentVideoIndex ? 'text-primary-foreground' : 'text-primary'}`} />
                    <span className="truncate">{video.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
      
      <section className="py-12 border-t bg-muted/30">
        <div className="max-w-2xl mx-auto px-4">
          {/* Add a review/rating */}
          {user && !userReview && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Rate this course</h3>
              <div className="flex items-center mb-2">
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <StarIcon className={`h-7 w-7 ${i <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm">{rating > 0 ? `${rating} / 5` : "Select rating"}</span>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={reviewMutation.isPending || rating === 0}
                  onClick={() => reviewMutation.mutate()}
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Rating"}
                </Button>
              </div>
            </div>
          )}
          {user && userReview && (
            <div className="mb-8 flex items-center text-green-700">
              <span className="mr-2">You rated this course:</span>
              {[1,2,3,4,5].map(i => (
                <StarIcon key={i} className={`h-6 w-6 ${i <= userReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
              ))}
              <span className="ml-2">{userReview.rating} / 5</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{comments.length} Comments</h2>
          </div>
          {/* Add a comment */}
          {user && (
            <div className="flex items-start gap-3 mb-8">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!comment.trim()) return;
                  addCommentMutation.mutate(comment.trim());
                }}
                className="flex-1"
              >
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  minLength={2}
                  maxLength={500}
                  disabled={addCommentMutation.isPending}
                  className="resize-none min-h-[48px]"
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" size="sm" disabled={addCommentMutation.isPending || !comment.trim()}>
                    {addCommentMutation.isPending ? "Posting..." : "Comment"}
                  </Button>
                </div>
              </form>
            </div>
          )}
          {/* Comments list */}
          <ul className="space-y-0 mb-8">
            {comments.map((c: any, idx: number) => (
              <li key={c._id || Math.random()} className="py-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={c.user?.avatar} alt={c.user?.username} />
                    <AvatarFallback>{c.user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-base">@{c.user?.username || "User"}</span>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="text-base leading-relaxed whitespace-pre-line mb-2">{c.content}</div>
                  </div>
                </div>
                {idx < comments.length - 1 && <Separator className="my-4" />}
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setCommentsPage(p => p + 1)}
              disabled={isFetchingComments || comments.length < COMMENTS_PAGE_SIZE}
            >
              {isFetchingComments ? "Loading..." : "Load more"}
            </Button>
          </div>
          {!user && <div className="text-muted-foreground mt-8">You must be logged in to comment.</div>}
        </div>
      </section>
      
      <SiteFooter />
    </div>
  );
} 