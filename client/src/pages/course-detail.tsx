import React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseJsonLd } from "@/components/json-ld";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Course, Lesson, Review } from "@shared/schema";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Calendar, 
  Star, 
  CheckCircle, 
  ChevronDown, 
  Play, 
  UserCircle,
  AlertTriangle,
  ThumbsUp, ThumbsDown, MessageCircle, Star as StarIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";


export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showRedirectNotice, setShowRedirectNotice] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const COMMENTS_PAGE_SIZE = 10;

  // Comments state and logic (moved to top)
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
  const { toast } = useToast();

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`, { credentials: 'include' });
      return res.json();
    },
    enabled: !!courseId,
  });
  
  const { data: lessons, isLoading: isLessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/lessons`, { credentials: 'include' });
      return res.json();
    },
    enabled: !!courseId,
  });
  
  const { data: reviews, isLoading: isReviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/courses/${courseId}/reviews`],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/reviews`, { credentials: 'include' });
      return res.json();
    },
    enabled: !!courseId,
  });
  
  const { data: enrollment, isLoading: isEnrollmentLoading } = useQuery<{ enrolled: boolean }>({
    queryKey: [`/api/courses/${courseId}/enrollment`],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/enrollment`, { credentials: 'include' });
      return res.json();
    },
    enabled: !!courseId && !!user,
  });
  
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/enrollment`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
    },
  });
  
  // Handler for external enrollment link
  const handleExternalEnroll = () => {
    if (course?.enrollmentLink) {
      setShowRedirectNotice(true);
      setTimeout(() => {
        window.location.href = course.enrollmentLink || '';
      }, 1200); // Show notice for 1.2s before redirect
    }
  };


  
  // Now, after all hooks and queries, use enrollment
  const userComments = comments.filter((c: any) => c.user?._id === user?._id);
  const canComment = enrollment?.enrolled && userComments.length < 5;
  
  // Add local state for userReview
  const [localUserReview, setLocalUserReview] = useState(null);
  const userReview = localUserReview || reviews?.find(r => (r.userId?._id || r.userId) === user?._id);
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
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      setRating(0);
      toast({ title: "Thank you!", description: "Your rating has been submitted." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to submit rating", variant: "destructive" });
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="ml-3 text-lg">Loading course...</p>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="text-center py-12">
              <CardHeader>
                <div className="mx-auto">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                </div>
                <CardTitle className="mt-4">Course Not Found</CardTitle>
                <CardDescription>
                  The course you're looking for doesn't exist or has been removed.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button asChild>
                  <Link href="/r">Browse Courses</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }
  
  const formattedDate = course.createdAt 
    ? new Date(course.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : "N/A";
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Add structured data for SEO */}
      <CourseJsonLd course={{
        title: course.title,
        description: course.description,
        instructor: course.instructorName || "Instructor",
        imageUrl: course.imageUrl,
        price: typeof course.price === 'number' ? course.price : undefined,
        duration: course.duration,
        level: "Beginner",
        slug: course.slug
      }} />
      <SiteHeader />
      
      <main className="flex-1">
        {/* Course Hero */}
        <section className="bg-muted/30 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 md:pr-8">
                <Link href="/r" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to courses
                </Link>

                {/* Move title, description, stats, instructor to top */}
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {course.title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  {course.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.lessonCount} lessons
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Updated {formattedDate}
                  </div>
                  {course.rating && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {course.rating} ({course.reviewCount} reviews)
                    </div>
                  )}
                </div>
                <div className="mt-6 flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>I</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Instructor</p>
                    <p className="text-xs text-muted-foreground">
                      {course.instructorName || "Course Instructor"}
                    </p>
                  </div>
                </div>

                {/* Course Overview moved below */}
                <Card className="mb-8 mt-8">
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                    <CardDescription>
                      What you'll learn in this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <h3>Description</h3>
                      <p>{course.longDescription || course.description}</p>

                      <h3 className="mt-8">What you'll learn</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {course.learningObjectives?.map((objective, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>

                      <h3 className="mt-8">Requirements</h3>
                      <ul>
                        {course.requirements?.map((requirement, i) => (
                          <li key={i}>{requirement}</li>
                        ))}
                      </ul>

                      <h3 className="mt-8">Who this course is for</h3>
                      <ul>
                        {course.targetAudience?.map((audience, i) => (
                          <li key={i}>{audience}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:w-1/3 mt-8 md:mt-0">
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                        </span>
                        {course.originalPrice && course.price && course.originalPrice > course.price ? (
                          <span className="text-muted-foreground line-through">
                            ${course.originalPrice.toFixed(2)}
                          </span>
                        ) : null}
                      </div>
                      {/* External Enrollment Link logic */}
                      {course.enrollmentLink ? (
                        <>
                          <Button className="w-full mt-4" onClick={handleExternalEnroll}>
                            Go to Enrollment
                          </Button>
                          {showRedirectNotice && (
                            <div className="mt-2 text-center text-sm text-primary">
                              Redirecting to external enrollment page...
                            </div>
                          )}
                        </>
                      ) : user ? (
                        enrollment?.enrolled ? (
                          <Button className="w-full mt-4" asChild>
                            <Link href={`/course/${courseId}/learn`}>
                              Continue Learning
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            className="w-full mt-4" 
                            onClick={() => enrollMutation.mutate()}
                            disabled={enrollMutation.isPending || isEnrollmentLoading}
                          >
                            {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                          </Button>
                        )
                      ) : (
                        <Button className="w-full mt-4" asChild>
                          <Link href="/auth">
                            Log in to Enroll
                          </Link>
                        </Button>
                      )}
                    </div>
                    
                    {/* New: Show rating and lesson count */}
                    <div className="mt-6 flex flex-col items-center">
                      <div className="flex items-center mb-2">
                        {Array(5).fill(0).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < (course.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {course.rating ? course.rating.toFixed(1) : "0.0"}
                          {typeof course.reviewCount === 'number' && (
                            <> ({course.reviewCount} reviews)</>
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {course.lessonCount || 0} lessons
                      </div>
                    </div>
                    
                    {course.videoLinks && course.videoLinks.length > 0 && enrollment?.enrolled && (
                      <div className="mt-4">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/course-videos?id=${courseId}`}>
                            <Play className="mr-2 h-4 w-4" />
                            View Video Links ({course.videoLinks.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                    
                    <Separator className="my-6" />
                    
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Remove the Tabs for Syllabus and Reviews and their content */}
            {/* The Accordion for lessons is removed as per the edit hint */}
            {/* The reviews section is removed as per the edit hint */}
          </div>
        </section>

        {/* Comments Section */}
        <section className="py-12 border-t">
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
      </main>
      
      <SiteFooter />
    </div>
  );
}
