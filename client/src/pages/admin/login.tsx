import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Code, Shield, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const { user, loginWithGoogle, loginWithGitHub, adminLoginWithGoogleIdMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleIdLogin, setShowGoogleIdLogin] = useState(false);
  const [googleId, setGoogleId] = useState("");
  const [username, setUsername] = useState("");
  
  // Redirect if user is already logged in and is admin
  useEffect(() => {
    if (user && user.isAdmin) {
      navigate("/admin");
    } else if (user && !user.isAdmin) {
      // If user is logged in but not admin, redirect to home
      navigate("/");
    }
  }, [user, navigate]);
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      loginWithGoogle();
    } catch (err) {
      setError('Failed to initiate Google login');
      setIsLoading(false);
    }
  };
  
  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      loginWithGitHub();
    } catch (err) {
      setError('Failed to initiate GitHub login');
      setIsLoading(false);
    }
  };

  const handleGoogleIdLogin = async () => {
    if (!googleId.trim() || !username.trim()) {
      setError('Please enter both Google ID and username');
      return;
    }

    setError(null);
    adminLoginWithGoogleIdMutation.mutate(
      { googleId: googleId.trim(), username: username.trim() },
      {
        onSuccess: () => {
          navigate("/admin");
        },
        onError: (err) => {
          setError(err.message || 'Login failed');
        }
      }
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-muted/50">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center">
                <Code className="h-8 w-8 text-primary" />
                <Shield className="h-6 w-6 text-primary ml-2" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Admin Access
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in with your authorized account to access the admin panel
            </p>
          </div>
          
          <div className="bg-background p-8 rounded-lg border shadow-sm">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-6">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Small checkbox for Google ID login */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="google-id-login"
                  checked={showGoogleIdLogin}
                  onCheckedChange={(checked) => setShowGoogleIdLogin(checked as boolean)}
                />
                <Label htmlFor="google-id-login" className="text-xs text-muted-foreground">
                  Admin login with Google ID
                </Label>
              </div>

              {/* Google ID + Username login form */}
              {showGoogleIdLogin && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="google-id" className="text-sm font-medium">
                      Google ID
                    </Label>
                    <Input
                      id="google-id"
                      type="text"
                      placeholder="Enter Google ID"
                      value={googleId}
                      onChange={(e) => setGoogleId(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleGoogleIdLogin}
                    disabled={adminLoginWithGoogleIdMutation.isPending}
                    className="w-full h-10"
                  >
                    {adminLoginWithGoogleIdMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4" />
                    )}
                    Admin Login
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full h-12"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FaGoogle className="mr-2 h-5 w-5 text-red-500" />
                  )}
                  Continue with Google
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full h-12"
                  onClick={handleGitHubLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FaGithub className="mr-2 h-5 w-5" />
                  )}
                  Continue with GitHub
                </Button>
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    Secure OAuth authentication
                  </span>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Only authorized administrators can access this panel.</p>
                <p>Your account must have admin privileges to proceed.</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/">
                <a className="text-sm text-muted-foreground hover:text-primary">
                  ← Back to Home
                </a>
              </Link>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>This page is restricted to authorized administrators only.</p>
            <p>Unauthorized access attempts will be logged and monitored.</p>
          </div>
        </div>
      </main>
    </div>
  );
} 