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
  Activity,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  BarChart,
  Eye,
  User,
  LogIn,
  LogOut,
  Globe,
  MapPin,
} from "lucide-react";
import { ContributionCalendar } from "@/components/ContributionCalendar";

export default function AdminUserActivity() {
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

  // Fetch user activity data
  const { data: userActivity, isLoading: isLoadingActivity } = useQuery<{
    totalLogins: number;
    activeUsers: number;
    newUsersThisWeek: number;
    loginActivity: Array<{
      date: string;
      count: number;
    }>;
    topActiveUsers: Array<{
      username: string;
      fullName?: string;
      loginCount: number;
      lastLogin: string;
    }>;
    recentLogins: Array<{
      username: string;
      fullName?: string;
      ipAddress: string;
      userAgent: string;
      loginTime: string;
    }>;
  }>({
    queryKey: ["/api/admin/user-activity"],
    queryFn: async () => {
      const res = await fetch("/api/admin/user-activity");
      if (!res.ok) throw new Error("Failed to fetch user activity");
      return res.json();
    },
  });

  // Extract stats or default to 0
  const users = stats?.users || 0;
  const enrollments = stats?.enrollments || 0;
  const reviews = stats?.reviews || 0;
  const recentUsers = stats?.recentUsers || 0;
  const recentEnrollments = stats?.recentEnrollments || 0;
  const recentReviews = stats?.recentReviews || 0;

  return (
    <AdminLayout 
      title="User Activity Tracking"
      description="Monitor user login activity and engagement patterns"
    >
      {/* Activity Overview */}
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
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingActivity ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  userActivity?.activeUsers || 0
                )}
              </div>
              <Activity className="h-8 w-8 text-green-500/60" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Last 30 days
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
              <div className="text-3xl font-bold">
                {isLoadingActivity ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  userActivity?.totalLogins || 0
                )}
              </div>
              <LogIn className="h-8 w-8 text-blue-500/60" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              All time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {isLoadingActivity ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                ) : (
                  userActivity?.newUsersThisWeek || 0
                )}
              </div>
              <User className="h-8 w-8 text-purple-500/60" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              This week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Engagement Metrics
            </CardTitle>
            <CardDescription>
              Key indicators of user engagement and activity
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
                  {recentEnrollments || 0}
                </div>
                <div className="text-sm text-muted-foreground">New Enrollments (7d)</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {recentReviews || 0}
                </div>
                <div className="text-sm text-muted-foreground">New Reviews (7d)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Activity Trends
            </CardTitle>
            <CardDescription>
              Recent activity patterns and growth
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
                  <BarChart className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">New Enrollments</span>
                </div>
                <span className="text-lg font-bold text-blue-600">+{recentEnrollments || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">New Reviews</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">+{recentReviews || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {userActivity?.recentLogins && userActivity.recentLogins.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LogIn className="h-5 w-5 mr-2" />
                Recent Logins
              </CardTitle>
              <CardDescription>
                Latest user login activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userActivity.recentLogins.slice(0, 5).map((login, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{login.fullName || login.username}</p>
                          <span className="text-xs text-muted-foreground">@{login.username}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{login.ipAddress}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{login.userAgent}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(login.loginTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {userActivity?.topActiveUsers && userActivity.topActiveUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Most Active Users
              </CardTitle>
              <CardDescription>
                Users with highest login activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userActivity.topActiveUsers.slice(0, 5).map((user, index) => (
                  <div key={user.username} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName || user.username}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{user.loginCount} logins</div>
                      <div className="text-xs text-muted-foreground">
                        Last: {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity Calendar */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Login Activity Calendar
          </CardTitle>
          <CardDescription>
            Visual representation of user login activity over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Activity Calendar</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Individual user activity calendars can be viewed from the user management section.
              This provides detailed login patterns for each user.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              What We Track
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <LogIn className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Login Activity</p>
                  <p className="text-sm text-muted-foreground">
                    Track when and how often users log in
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">IP Addresses</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor login locations and patterns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">User Agents</p>
                  <p className="text-sm text-muted-foreground">
                    Track device and browser information
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Activity Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Activity className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Active Users</p>
                  <p className="text-sm text-muted-foreground">
                    Users who logged in within the last 30 days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Engagement Trends</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor user engagement over time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">User Growth</p>
                  <p className="text-sm text-muted-foreground">
                    Track new user registrations and activity
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 