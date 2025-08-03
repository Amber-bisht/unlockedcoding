import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Ban, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  banned: boolean;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isAdmin) navigate("/");
    fetchUsers();
    // eslint-disable-next-line
  }, [user]);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("GET", "/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleBan(id: string, banned: boolean) {
    try {
      await apiRequest("PATCH", `/api/admin/users/${id}/ban`, { banned: !banned });
      setUsers(users.map(u => u._id === id ? { ...u, banned: !banned } : u));
    } catch {
      alert("Failed to update user ban status");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" /> Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : users.length === 0 ? (
                <div>No users found.</div>
              ) : (
                <ul className="divide-y">
                  {users.map((u) => (
                    <li key={u._id || Math.random()} className="py-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{u.username}</div>
                        <div className="text-muted-foreground text-sm mb-1">{u.email}</div>
                        <div className="text-xs">{u.isAdmin ? "Admin" : "User"} {u.banned && <span className="text-red-600 ml-2">(Banned)</span>}</div>
                      </div>
                      <Button
                        variant={u.banned ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleBan(u._id || '', u.banned)}
                      >
                        {u.banned ? <Check className="h-4 w-4 mr-1" /> : <Ban className="h-4 w-4 mr-1" />}
                        {u.banned ? "Unban" : "Ban"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
} 