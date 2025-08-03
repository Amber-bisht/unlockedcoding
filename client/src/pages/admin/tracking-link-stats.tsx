import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  MousePointer,
  TrendingUp,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Copy,
  Globe,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrackingStats {
  trackingLink: {
    id: string;
    name: string;
    description?: string;
    targetUrl: string;
    trackingCode: string;
    trackingUrl: string;
    isActive: boolean;
    clickCount: number;
    loginCount: number;
    conversionRate: number;
    createdAt: string;
  };
  periodStats: {
    totalClicks: number;
    totalLogins: number;
    conversionRate: number;
  };
  dailyStats: Array<{
    _id: string;
    events: Array<{
      eventType: string;
      count: number;
    }>;
  }>;
  recentEvents: Array<{
    _id: string;
    eventType: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    userId?: {
      username: string;
      fullName?: string;
      email?: string;
    };
  }>;
}

export default function TrackingLinkStats() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [period, setPeriod] = useState("7d");

  // Extract tracking link ID from URL
  const trackingLinkId = location.split("/").pop();

  const { data: stats, isLoading } = useQuery<TrackingStats>({
    queryKey: [`/api/admin/tracking-links/${trackingLinkId}/stats`, period],
    queryFn: async () => {
      const res = await fetch(`/api/admin/tracking-links/${trackingLinkId}/stats?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch tracking stats");
      return res.json();
    },
    enabled: !!trackingLinkId,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Tracking Link Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The tracking link you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/admin/tracking-links">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tracking Links
              </Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/admin/tracking-links">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{stats.trackingLink.name}</h1>
              <p className="text-muted-foreground">
                {stats.trackingLink.description || "No description"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={stats.trackingLink.isActive ? "default" : "secondary"}>
              {stats.trackingLink.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(stats.trackingLink.trackingUrl)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={stats.trackingLink.trackingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Test Link
              </a>
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trackingLink.clickCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.periodStats.totalClicks} in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trackingLink.loginCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.periodStats.totalLogins} in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trackingLink.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.periodStats.conversionRate.toFixed(1)}% in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {new Date(stats.trackingLink.createdAt).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(stats.trackingLink.createdAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Link Details */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Target URL</CardTitle>
              <CardDescription>The destination URL users are redirected to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <a
                  href={stats.trackingLink.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {stats.trackingLink.targetUrl}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(stats.trackingLink.targetUrl)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking URL</CardTitle>
              <CardDescription>The URL you share with users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                  {stats.trackingLink.trackingUrl}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(stats.trackingLink.trackingUrl)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest clicks and logins from this tracking link</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentEvents.length > 0 ? (
              <div className="space-y-4">
                {stats.recentEvents.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {event.eventType === "click" ? (
                          <MousePointer className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Users className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant={event.eventType === "click" ? "secondary" : "default"}>
                          {event.eventType === "click" ? "Click" : "Login"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {event.userId ? (
                            `${event.userId.fullName || event.userId.username} (${event.userId.email})`
                          ) : (
                            "Anonymous User"
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.ipAddress && (
                            <>
                              <Globe className="h-3 w-3 inline mr-1" />
                              {event.ipAddress}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No events yet</h3>
                <p className="text-muted-foreground">
                  Events will appear here once users start clicking your tracking link.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
} 