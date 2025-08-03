import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  course?: string;
  user?: {
    username?: string;
    email?: string;
  };
}

export default function AdminCommentsPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isAdmin) navigate("/");
    fetchComments();
    // eslint-disable-next-line
  }, [user]);

  async function fetchComments() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("GET", "/api/comments");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await apiRequest("DELETE", `/api/comments/${id}`);
      setComments(comments.filter(c => c._id !== id));
    } catch {
      alert("Failed to delete comment");
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
                <MessageCircle className="h-6 w-6" /> Manage Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : comments.length === 0 ? (
                <div>No comments found.</div>
              ) : (
                <ul className="divide-y">
                  {comments.map((c) => (
                    <li key={c._id || Math.random()} className="py-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-semibold">{c.user?.username || c.user?.email || "User"}</div>
                          {c.course && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {c.course}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-sm mb-1">{new Date(c.createdAt).toLocaleString()}</div>
                        <div className="text-sm">{c.content}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(c._id)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
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