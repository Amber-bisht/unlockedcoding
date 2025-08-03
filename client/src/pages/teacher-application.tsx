import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CheckCircle, XCircle, Clock, User, BookOpen, Send } from 'lucide-react';
import { Link } from 'wouter';
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

interface TeacherStatus {
  role: 'user' | 'teacher' | 'admin';
  teacherApprovalStatus?: 'pending' | 'approved' | 'rejected';
  teacherRejectionReason?: string;
  teacherApprovalDate?: string;
  teacherRejectionDate?: string;
}

const TeacherApplication: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teacherStatus, setTeacherStatus] = useState<TeacherStatus | null>(null);
  const [applicationData, setApplicationData] = useState({
    bio: '',
    experience: '',
    expertise: '',
    motivation: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('TeacherApplication component rendered', { user, loading });

  useEffect(() => {
    if (user) {
      checkTeacherStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkTeacherStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking teacher status...');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/auth/teacher-status', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Teacher status data:', data);
        setTeacherStatus(data);
      } else {
        console.error('Failed to get teacher status:', response.status, response.statusText);
        // Set default status for non-authenticated users
        setTeacherStatus({ role: 'user' });
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      // Set default status for non-authenticated users
      setTeacherStatus({ role: 'user' });
    } finally {
      setLoading(false);
    }
  };

  const resetTeacherStatus = async () => {
    try {
      const response = await fetch('/api/auth/reset-teacher-status', {
        method: 'POST',
      });
      
      if (response.ok) {
        setTeacherStatus({ role: 'user' });
        toast({
          title: "Status Reset",
          description: "You can now submit a new application.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to reset status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationData.bio.trim() || !applicationData.experience.trim() || 
        !applicationData.expertise.trim() || !applicationData.motivation.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/auth/apply-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your teacher application has been submitted successfully!",
        });
        checkTeacherStatus();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading teacher application...</p>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                  <p className="text-muted-foreground mb-4">
                    Please log in to apply for teacher role
                  </p>
                  <Link href="/auth">
                    <Button>Login to Apply</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  console.log('User is authenticated, teacher status:', teacherStatus);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Become a Teacher</h1>
            <p className="text-muted-foreground">
              Share your knowledge and create courses for our community
            </p>
          </div>

          {teacherStatus?.role === 'teacher' && teacherStatus?.teacherApprovalStatus === 'approved' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  You're Already a Teacher!
                </CardTitle>
                <CardDescription>
                  Congratulations! You have been approved as a teacher and can now create courses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(teacherStatus.teacherApprovalStatus)}
                  {teacherStatus.teacherApprovalDate && (
                    <span className="text-sm text-muted-foreground">
                      Approved on {formatDate(teacherStatus.teacherApprovalDate)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href="/teacher-dashboard">
                    <Button>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Go to Teacher Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/add-course">
                    <Button variant="outline">
                      Create Course
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : teacherStatus?.teacherApprovalStatus === 'pending' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Application Under Review
                </CardTitle>
                <CardDescription>
                  Your teacher application is currently being reviewed by our admin team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  {getStatusBadge(teacherStatus.teacherApprovalStatus)}
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll notify you once your application has been reviewed. This usually takes 1-3 business days.
                </p>
              </CardContent>
            </Card>
          ) : teacherStatus?.teacherApprovalStatus === 'rejected' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Application Rejected
                </CardTitle>
                <CardDescription>
                  Your previous teacher application was not approved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(teacherStatus.teacherApprovalStatus)}
                  {teacherStatus.teacherRejectionDate && (
                    <span className="text-sm text-muted-foreground">
                      Rejected on {formatDate(teacherStatus.teacherRejectionDate)}
                    </span>
                  )}
                </div>
                {teacherStatus.teacherRejectionReason && (
                  <div>
                    <Label className="text-sm font-medium">Reason for Rejection:</Label>
                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                      {teacherStatus.teacherRejectionReason}
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  You can submit a new application after 1 month from the rejection date.
                </p>
                {(() => {
                  const rejectionDate = teacherStatus.teacherRejectionDate ? new Date(teacherStatus.teacherRejectionDate) : null;
                  const oneMonthLater = rejectionDate ? new Date(rejectionDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
                  const canReapply = !oneMonthLater || new Date() >= oneMonthLater;
                  
                  return canReapply ? (
                    <Button onClick={resetTeacherStatus}>
                      Submit New Application
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      You can reapply on {oneMonthLater?.toLocaleDateString()}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Teacher Application</CardTitle>
                    <CardDescription>
                      Tell us about yourself and why you want to become a teacher
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself, your background, and expertise..."
                          value={applicationData.bio}
                          onChange={(e) => setApplicationData({ ...applicationData, bio: e.target.value })}
                          className="mt-1"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="experience">Teaching Experience</Label>
                        <Textarea
                          id="experience"
                          placeholder="Describe your teaching experience, if any..."
                          value={applicationData.experience}
                          onChange={(e) => setApplicationData({ ...applicationData, experience: e.target.value })}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="expertise">Areas of Expertise</Label>
                        <Textarea
                          id="expertise"
                          placeholder="What subjects or topics would you like to teach?"
                          value={applicationData.expertise}
                          onChange={(e) => setApplicationData({ ...applicationData, expertise: e.target.value })}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="motivation">Motivation</Label>
                        <Textarea
                          id="motivation"
                          placeholder="Why do you want to become a teacher on our platform?"
                          value={applicationData.motivation}
                          onChange={(e) => setApplicationData({ ...applicationData, motivation: e.target.value })}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Benefits of Being a Teacher</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium">Create Courses</h4>
                        <p className="text-sm text-muted-foreground">
                          Design and publish your own courses with video content
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium">Reach Students</h4>
                        <p className="text-sm text-muted-foreground">
                          Connect with learners from around the world
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium">Build Your Brand</h4>
                        <p className="text-sm text-muted-foreground">
                          Establish yourself as an expert in your field
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium">Analytics & Insights</h4>
                        <p className="text-sm text-muted-foreground">
                          Track your course performance and student engagement
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Application Process</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                      <div>
                        <h4 className="font-medium">Submit Application</h4>
                        <p className="text-sm text-muted-foreground">
                          Fill out the form with your details and motivation
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                      <div>
                        <h4 className="font-medium">Admin Review</h4>
                        <p className="text-sm text-muted-foreground">
                          Our team will review your application within 1-3 days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <div>
                        <h4 className="font-medium">Get Approved</h4>
                        <p className="text-sm text-muted-foreground">
                          Start creating courses and teaching students
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default TeacherApplication; 