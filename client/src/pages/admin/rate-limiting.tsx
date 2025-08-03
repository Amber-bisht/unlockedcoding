import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Ban,
  Shield,
  AlertTriangle,
  Clock,
  User,
  Activity,
} from "lucide-react";

export default function AdminRateLimiting() {
  const { user } = useAuth();
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
    <AdminLayout 
      title="Rate Limiting Management"
      description="Monitor and manage blocked IP addresses from failed login attempts"
    >
      {/* Overview Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Rate Limiting Overview
          </CardTitle>
          <CardDescription>
            The system automatically blocks IP addresses after 10 failed login attempts per day.
            Blocked IPs are automatically unblocked after 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {blockedIPs?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Currently Blocked</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">10</div>
              <div className="text-sm text-muted-foreground">Max Attempts/Day</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">24h</div>
              <div className="text-sm text-muted-foreground">Block Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked IPs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ban className="h-5 w-5 mr-2" />
            Blocked IP Addresses
          </CardTitle>
          <CardDescription>
            IP addresses that have been blocked due to excessive failed login attempts
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Unblock all IPs
                    blockedIPs.forEach(ip => unblockMutation.mutate(ip.ipAddress));
                  }}
                  disabled={unblockMutation.isPending}
                >
                  {unblockMutation.isPending ? "Unblocking All..." : "Unblock All"}
                </Button>
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

      {/* Rate Limiting Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              How Rate Limiting Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Failed Login Attempts</p>
                  <p className="text-sm text-muted-foreground">
                    Each failed login attempt is tracked per IP address
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Threshold Reached</p>
                  <p className="text-sm text-muted-foreground">
                    After 10 failed attempts within 24 hours, the IP is blocked
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">Automatic Unblock</p>
                  <p className="text-sm text-muted-foreground">
                    Blocked IPs are automatically unblocked after 24 hours
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Security Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Brute Force Protection</p>
                  <p className="text-sm text-muted-foreground">
                    Prevents automated password guessing attacks
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Account Security</p>
                  <p className="text-sm text-muted-foreground">
                    Protects user accounts from unauthorized access attempts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">System Performance</p>
                  <p className="text-sm text-muted-foreground">
                    Reduces server load from malicious login attempts
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