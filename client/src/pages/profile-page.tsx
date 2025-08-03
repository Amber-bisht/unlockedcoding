import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAchievements } from "@/hooks/use-achievements";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Award,
  Edit,
  Building,
  Briefcase,
  Github,
  Linkedin,
  Twitter,
  Code
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Enrollment } from "@shared/schema";
import { ContributionCalendar } from "@/components/ContributionCalendar";

export default function ProfilePage() {
  const { user } = useAuth();
  const { achievements, stats, loading: loadingAchievements } = useAchievements();
  
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery<any[]>({
    queryKey: ["/api/profile/user/enrollments"],
    enabled: !!user,
  });
  
  if (!user) return null;
  
  const formattedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";
  
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Sidebar */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader className="flex flex-col items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profileImageUrl || user.avatar || ""} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4 text-2xl">{user.fullName || user.username}</CardTitle>
                  <CardDescription>{user.isAdmin ? "Administrator" : "Student"}</CardDescription>
                  
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/profile/edit">
                      <a className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </a>
                    </Link>
                  </Button>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{user.username}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>Joined on {formattedDate}</span>
                    </div>
                    {user.interest && (
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Interested in {user.interest.replace("-", " ")}</span>
                      </div>
                    )}
                    {user.collegeName && (
                      <div className="flex items-center">
                        <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{user.collegeName}</span>
                      </div>
                    )}
                    {user.companyName && (
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{user.companyName}</span>
                      </div>
                    )}
                  </div>
                  
                                      {user.bio && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="text-sm font-medium mb-2">About</h4>
                          <p className="text-sm text-muted-foreground">{user.bio}</p>
                        </div>
                      </>
                    )}
                    
                    {/* Social Links */}
                    {(user.githubLink || user.linkedinLink || user.xLink || user.codeforcesLink || user.leetcodeLink) && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="text-sm font-medium mb-2">Social Links</h4>
                          <div className="flex flex-wrap gap-2">
                            {user.githubLink && (
                              <a 
                                href={user.githubLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Github className="h-4 w-4 mr-1" />
                                GitHub
                              </a>
                            )}
                            {user.linkedinLink && (
                              <a 
                                href={user.linkedinLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Linkedin className="h-4 w-4 mr-1" />
                                LinkedIn
                              </a>
                            )}
                            {user.xLink && (
                              <a 
                                href={user.xLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Twitter className="h-4 w-4 mr-1" />
                                X (Twitter)
                              </a>
                            )}
                            {user.codeforcesLink && (
                              <a 
                                href={user.codeforcesLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Code className="h-4 w-4 mr-1" />
                                Codeforces
                              </a>
                            )}
                            {user.leetcodeLink && (
                              <a 
                                href={user.leetcodeLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Code className="h-4 w-4 mr-1" />
                                LeetCode
                              </a>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="courses" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="courses" className="flex-1">My Courses</TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                  <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="courses" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Enrolled Courses</CardTitle>
                      <CardDescription>
                        Courses you're currently taking or have completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingEnrollments ? (
                        <div className="text-center py-8">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                          <p className="mt-4 text-muted-foreground">Loading your courses...</p>
                        </div>
                      ) : enrollments && enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {enrollments.map((enrollment) => (
                            <Card key={enrollment._id || enrollment.courseId?._id || Math.random()} className="overflow-hidden">
                              <div className="h-32 w-full overflow-hidden">
                                <img 
                                  src={enrollment.courseId?.imageUrl} 
                                  alt={enrollment.courseId?.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <CardContent className="p-4">
                                <Link href={`/course/${enrollment.courseId?._id}`}>
                                  <a className="text-lg font-medium hover:text-primary">
                                    {enrollment.courseId?.title}
                                  </a>
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {enrollment.courseId?.description?.substring(0, 100)}...
                                </p>
                                <div className="flex justify-between items-center mt-3">
                                  <span className="text-xs text-muted-foreground">
                                    {enrollment.progress}% complete
                                  </span>
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/course/${enrollment.courseId?._id}`}>
                                      Continue
                                    </Link>
                                  </Button>
                                </div>
                                {enrollment.courseId?.videoLinks && enrollment.courseId.videoLinks.length > 0 && (
                                  <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                                    <a href={`http://localhost:5000/course-videos?id=${enrollment.courseId?._id}`}>
                                      Watch Lectures ({enrollment.courseId.videoLinks.length})
                                    </a>
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No courses yet</h3>
                          <p className="mt-2 text-muted-foreground">
                            You haven't enrolled in any courses yet.
                          </p>
                          <Button asChild className="mt-6">
                            <Link href="/r">
                              Browse Courses
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity" className="mt-6">
                  <div className="space-y-6">
                    <div className="w-full max-w-md mx-auto">
                      <ContributionCalendar />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Achievements</CardTitle>
                      <CardDescription>
                        Certificates and accomplishments you've earned
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingAchievements ? (
                        <div className="text-center py-12">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                          <p className="mt-4 text-muted-foreground">Loading achievements...</p>
                        </div>
                      ) : achievements && achievements.length > 0 ? (
                        <div className="space-y-4">
                          {stats && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="text-center p-4 bg-primary/10 rounded-lg">
                                <div className="text-2xl font-bold text-primary">{stats.unlockedCount}</div>
                                <div className="text-sm text-muted-foreground">Unlocked</div>
                              </div>
                              <div className="text-center p-4 bg-primary/10 rounded-lg">
                                <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
                                <div className="text-sm text-muted-foreground">Points</div>
                              </div>
                              <div className="text-center p-4 bg-primary/10 rounded-lg">
                                <div className="text-2xl font-bold text-primary">{stats.totalAchievements}</div>
                                <div className="text-sm text-muted-foreground">Total</div>
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {achievements.map((achievement) => (
                              <Card key={achievement._id} className={`overflow-hidden ${achievement.isUnlocked ? 'border-primary' : 'border-muted'}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                      achievement.isUnlocked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>
                                      <Award className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium">{achievement.title}</h3>
                                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                      <div className="flex items-center mt-2">
                                        <span className="text-xs text-muted-foreground">
                                          {achievement.points} points
                                        </span>
                                        {achievement.isUnlocked && achievement.unlockedAt && (
                                          <span className="text-xs text-muted-foreground ml-2">
                                            • {new Date(achievement.unlockedAt).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Award className="h-12 w-12 mx-auto text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No achievements yet</h3>
                          <p className="mt-2 text-muted-foreground">
                            Complete your profile and courses to earn achievements.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
