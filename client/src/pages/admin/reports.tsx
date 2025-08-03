import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
  Star,
  MessageCircle,
  Bell,
  TrendingUp,
  Activity,
  Eye,
  MousePointer,
  Link as LinkIcon,
  Calendar,
  Clock,
  Target,
  Award,
} from "lucide-react";
import { ContributionCalendar } from "@/components/ContributionCalendar";

export default function AdminReports() {
  const { user } = useAuth();

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

  return (
    <AdminLayout 
      title="Platform Reports"
      description="Comprehensive analytics and metrics for your platform"
    >
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  users || 0
                )}
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
            <div className="mt-2 text-sm text-green-600">
              +{recentUsers || 0} this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  courses || 0
                )}
              </div>
              <Bookmark className="h-8 w-8 text-blue-500/60" />
            </div>
            <div className="mt-2 text-sm text-blue-600">
              +{recentCourses || 0} this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  enrollments || 0
                )}
              </div>
              <BarChart className="h-8 w-8 text-purple-500/60" />
            </div>
            <div className="mt-2 text-sm text-purple-600">
              +{recentEnrollments || 0} this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  reviews || 0
                )}
              </div>
              <Star className="h-8 w-8 text-yellow-500/60" />
            </div>
            <div className="mt-2 text-sm text-yellow-600">
              +{recentReviews || 0} this week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  categories || 0
                )}
              </div>
              <FolderOpen className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  lessons || 0
                )}
              </div>
              <Bookmark className="h-8 w-8 text-indigo-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  comments || 0
                )}
              </div>
              <MessageCircle className="h-8 w-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contact Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingStats ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  contactSubmissions || 0
                )}
              </div>
              <MessageCircle className="h-8 w-8 text-red-500/60" />
            </div>
            {unreadContacts > 0 && (
              <div className="mt-2 text-sm text-red-600 font-medium">
                {unreadContacts} unread
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tracking Metrics */}
      {trackingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tracking Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {trackingStats.totalLinks || 0}
                </div>
                <LinkIcon className="h-8 w-8 text-indigo-500/60" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {trackingStats.activeLinks || 0} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-600">
                  {trackingStats.totalClicks || 0}
                </div>
                <MousePointer className="h-8 w-8 text-blue-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">
                  {trackingStats.totalLogins || 0}
                </div>
                <Users className="h-8 w-8 text-green-500/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-purple-600">
                  {trackingStats.overallConversionRate?.toFixed(1) || 0}%
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Platform Performance
            </CardTitle>
            <CardDescription>
              Key performance indicators and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {enrollments > 0 && users > 0 ? ((enrollments / users) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Enrollment Rate</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {reviews > 0 && enrollments > 0 ? ((reviews / enrollments) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Review Rate</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {lessons > 0 && courses > 0 ? (lessons / courses).toFixed(1) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Lessons/Course</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {reviews > 0 ? (reviews / courses).toFixed(1) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Reviews/Course</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Weekly Growth
            </CardTitle>
            <CardDescription>
              Recent activity and growth trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium">New Users</span>
                </div>
                <span className="text-lg font-bold text-green-600">+{recentUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Bookmark className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">New Courses</span>
                </div>
                <span className="text-lg font-bold text-blue-600">+{recentCourses || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <BarChart className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">New Enrollments</span>
                </div>
                <span className="text-lg font-bold text-purple-600">+{recentEnrollments || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">New Reviews</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">+{recentReviews || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      {stats?.topCategories && stats.topCategories.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top Categories by Course Count
            </CardTitle>
            <CardDescription>
              Most popular categories based on course distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCategories.map((category, index) => (
                <div key={category._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{category.category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.courseCount} courses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {((category.courseCount / courses) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">of total courses</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {stats.recentContacts.slice(0, 5).map((contact) => (
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                {stats.recentReviewsList.slice(0, 5).map((review) => (
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