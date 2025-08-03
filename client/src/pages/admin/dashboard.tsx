import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  FolderOpen,
  Bookmark,
  Users,
  BarChart,
  Shield,
  AlertTriangle,
  PlusCircle,
  Bell,
  Star,
  MessageCircle,
  Ban,
  Link as LinkIcon,
  MousePointer,
  TrendingUp,
  Activity,
  Eye,
} from "lucide-react";
import { ContributionCalendar } from "@/components/ContributionCalendar";

// Rate Limiting Tab Component
function RateLimitingTab() {
  const queryClient = useQueryClient();

  const { data: blockedIPs, isLoading } = useQuery<Array<{
    ipAddress: string;
    username?: string;
    attemptCount: number;
    lastAttempt: string;
    blockedUntil: string;
    remainingTime: number;
  }>>({
    queryKey: ["/api/auth/blocked-ips"],
    queryFn: async () => {
      const res = await fetch("/api/auth/blocked-ips");
      if (!res.ok) throw new Error("Failed to fetch blocked IPs");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unblockMutation = useMutation({
    mutationFn: async (ipAddress: string) => {
      const res = await fetch(`/api/auth/blocked-ips/${ipAddress}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to unblock IP");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/blocked-ips"] });
    },
  });

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ban className="h-5 w-5 mr-2" />
          Rate Limiting Management
        </CardTitle>
        <CardDescription>
          Monitor and manage blocked IP addresses from failed login attempts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : blockedIPs && blockedIPs.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {blockedIPs.length} IP address{blockedIPs.length !== 1 ? 'es' : ''} currently blocked
              </p>
            </div>
            <div className="space-y-3">
              {blockedIPs.map((ip) => (
                <div key={ip.ipAddress} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{ip.ipAddress}</p>
                        {ip.username && (
                          <p className="text-sm text-muted-foreground">Username: {ip.username}</p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Attempts: {ip.attemptCount}</p>
                        <p>Last attempt: {formatDate(ip.lastAttempt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-destructive">
                        Blocked for: {formatTime(ip.remainingTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Until: {formatDate(ip.blockedUntil)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unblockMutation.mutate(ip.ipAddress)}
                      disabled={unblockMutation.isPending}
                    >
                      {unblockMutation.isPending ? "Unblocking..." : "Unblock"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Ban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Blocked IPs</h3>
            <p className="text-muted-foreground text-center max-w-md">
              All IP addresses are currently allowed to attempt login. The system automatically blocks IPs after 10 failed login attempts per day.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Temporarily disabled admin check during development
  /*useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);*/

  const { data: stats, isLoading: isLoadingStats } = useQuery<{
    users: number;
    courses: number;
    categories: number;
    enrollments: number;
    lessons: number;
    reviews: number;
    comments: number;
    notifications: number;
    contactSubmissions: number;
    unreadContacts: number;
    popularCourses: number;
    recentUsers: number;
    recentCourses: number;
    recentEnrollments: number;
    recentReviews: number;
    topCategories: Array<{ _id: string; courseCount: number; category: { name: string; slug: string } }>;
    recentContacts: Array<{ _id: string; name: string; email: string; purpose: string; message: string; isRead: boolean; createdAt: string }>;
    recentReviewsList: Array<{ _id: string; title: string; content: string; rating: number; createdAt: string; userId: { username: string; fullName?: string }; courseId: { title: string } }>;
  }>({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats");
      return res.json();
    },
  });

  // Extract stats or default to 0
  const categories = stats?.categories || 0;
  const courses = stats?.courses || 0;
  const users = stats?.users || 0;
  const enrollments = stats?.enrollments || 0;
  const lessons = stats?.lessons || 0;
  const reviews = stats?.reviews || 0;
  const comments = stats?.comments || 0;
  const notifications = stats?.notifications || 0;
  const contactSubmissions = stats?.contactSubmissions || 0;
  const unreadContacts = stats?.unreadContacts || 0;
  const popularCourses = stats?.popularCourses || 0;
  const recentUsers = stats?.recentUsers || 0;
  const recentCourses = stats?.recentCourses || 0;
  const recentEnrollments = stats?.recentEnrollments || 0;
  const recentReviews = stats?.recentReviews || 0;
  
  // Combined loading state
  const isLoadingCategories = isLoadingStats;
  const isLoadingCourses = isLoadingStats;
  const isLoadingUsers = isLoadingStats;
  const isLoadingEnrollments = isLoadingStats;

  // Fetch tracking dashboard stats
  const { data: trackingStats } = useQuery<{
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    totalLogins: number;
    overallConversionRate: number;
    recentLinks: Array<{
      _id: string;
      name: string;
      clickCount: number;
      loginCount: number;
      conversionRate: number;
      createdAt: string;
    }>;
    topLinks: Array<{
      _id: string;
      name: string;
      clickCount: number;
      loginCount: number;
      conversionRate: number;
    }>;
  }>({
    queryKey: ["/api/admin/tracking-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tracking-dashboard");
      if (!res.ok) throw new Error("Failed to fetch tracking stats");
      return res.json();
    },
  });

  // Temporarily disabled admin check for development
  /*if (!user || !user.isAdmin) {
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
                <CardTitle className="mt-4">Access Denied</CardTitle>
                <CardDescription>
                  You don't have permission to access this page.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }*/

  return (
    <AdminLayout 
      title="Admin Dashboard"
      description="Manage your platform's content and users"
    >
      {/* Quick Actions Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
            <p className="text-muted-foreground mt-1">
              Manage your platform content from here
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <Shield className="mr-2 h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-600">Admin Mode</span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/categories">
              <FolderOpen className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Manage Categories</p>
                <p className="text-muted-foreground text-xs">Add, edit or delete categories</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/add-category">
              <PlusCircle className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Add Category</p>
                <p className="text-muted-foreground text-xs">Create a new course category</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/courses">
              <Bookmark className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Manage Courses</p>
                <p className="text-muted-foreground text-xs">Create and edit course content</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/add-course">
              <PlusCircle className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Add Course</p>
                <p className="text-muted-foreground text-xs">Create a new course</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/send-notification">
              <Bell className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Send Notification</p>
                <p className="text-muted-foreground text-xs">Notify users about updates</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/manage-popular-courses">
              <Star className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Manage Popular Courses</p>
                <p className="text-muted-foreground text-xs">SEO static pages for top courses</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/comments">
              <MessageCircle className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Manage Comments</p>
                <p className="text-muted-foreground text-xs">View and delete user comments</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/tracking-links">
              <LinkIcon className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Tracking Links</p>
                <p className="text-muted-foreground text-xs">Create and monitor tracking links</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/users">
              <Users className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Manage Users</p>
                <p className="text-muted-foreground text-xs">Ban or unban users</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/contact">
              <MessageCircle className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Contact Submissions</p>
                <p className="text-muted-foreground text-xs">View user inquiries and requests</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/admin/manage-teachers">
              <Shield className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">Manage Teachers</p>
                <p className="text-muted-foreground text-xs">Review teacher applications</p>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 justify-start">
            <Link href="/">
              <Eye className="h-5 w-5 mr-2" />
              <div className="text-left">
                <p className="font-medium">View Site</p>
                <p className="text-muted-foreground text-xs">See your platform as users see it</p>
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Made smaller */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {isLoadingCategories ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  categories || 0
                )}
              </div>
              <FolderOpen className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Categories</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {isLoadingCourses ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  courses || 0
                )}
              </div>
              <Bookmark className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Courses</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {isLoadingUsers ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  users || 0
                )}
              </div>
              <Users className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Users</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {isLoadingEnrollments ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  enrollments || 0
                )}
              </div>
              <BarChart className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enrollments</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {isLoadingStats ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  lessons || 0
                )}
              </div>
              <Bookmark className="h-5 w-5 text-blue-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lessons</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {isLoadingStats ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  reviews || 0
                )}
              </div>
              <Star className="h-5 w-5 text-yellow-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics Row - Made smaller */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {isLoadingStats ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  contactSubmissions || 0
                )}
              </div>
              <MessageCircle className="h-5 w-5 text-green-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Contacts</p>
            {unreadContacts > 0 && (
              <p className="text-xs text-red-600 font-medium">
                {unreadContacts} unread
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {isLoadingStats ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  popularCourses || 0
                )}
              </div>
              <Star className="h-5 w-5 text-purple-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Popular</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-green-600">
                {isLoadingStats ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  recentUsers || 0
                )}
              </div>
              <Users className="h-5 w-5 text-green-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">New Users</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-blue-600">
                {isLoadingStats ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  recentCourses || 0
                )}
              </div>
              <Bookmark className="h-5 w-5 text-blue-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">New Courses</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-purple-600">
                {isLoadingStats ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  recentEnrollments || 0
                )}
              </div>
              <BarChart className="h-5 w-5 text-purple-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enrollments</p>
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-yellow-600">
                {isLoadingStats ? (
                  <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                ) : (
                  recentReviews || 0
                )}
              </div>
              <Star className="h-5 w-5 text-yellow-500/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">New Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Statistics Row - Made smaller */}
      {trackingStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 mb-6">
          <Card className="p-3">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">
                  {trackingStats.totalLinks || 0}
                </div>
                <LinkIcon className="h-5 w-5 text-indigo-500/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Tracking Links</p>
              <p className="text-xs text-muted-foreground">
                {trackingStats.activeLinks || 0} active
              </p>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  {trackingStats.totalClicks || 0}
                </div>
                <MousePointer className="h-5 w-5 text-blue-500/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total Clicks</p>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-green-600">
                  {trackingStats.totalLogins || 0}
                </div>
                <Users className="h-5 w-5 text-green-500/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total Logins</p>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-purple-600">
                  {trackingStats.overallConversionRate?.toFixed(1) || 0}%
                </div>
                <TrendingUp className="h-5 w-5 text-purple-500/60" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Conversion Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contact Submissions */}
        {stats?.recentContacts && stats.recentContacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Recent Contact Submissions
              </CardTitle>
              <CardDescription>
                Latest user inquiries and requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentContacts.map((contact) => (
                  <div key={contact._id || Math.random()} className={`p-3 rounded-lg border ${contact.isRead ? 'bg-muted/30' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{contact.name}</p>
                          {!contact.isRead && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">New</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{contact.email}</p>
                        <p className="text-sm font-medium capitalize mb-1">{contact.purpose.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{contact.message}</p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin/contact">
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Reviews */}
        {stats?.recentReviewsList && stats.recentReviewsList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Recent Reviews
              </CardTitle>
              <CardDescription>
                Latest course reviews and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentReviewsList.map((review) => (
                  <div key={review._id || Math.random()} className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{review.userId.fullName || review.userId.username}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{review.courseId.title}</p>
                        {review.title && (
                          <p className="text-sm font-medium mb-1">{review.title}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/admin/courses">
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
