import React from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Code, 
  CheckCircle,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Zap,
  Globe,
  Shield,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { useAds } from "@/hooks/use-ads";
import { AdCard } from "@/components/AdCard";



export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", { credentials: 'include' });
      return res.json();
    },
  });

  const { data: categoryAds = [] } = useAds('categories');



  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section - Text Only */}
        <section className="relative bg-gradient-to-br from-background via-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Code className="w-4 h-4 mr-2" />
                  Learn to Code Like a Pro
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6">
                <span className="block">Unlock your coding</span>
                <span className="block text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">potential today</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Master modern programming skills with our comprehensive, project-based courses. 
                From web development to data science, we provide the tools you need to build your future in tech.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                  <Link href="/r">
                    Start Learning Now
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                  <a href="#featured-courses">
                    Explore Courses
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why Choose <span className="text-primary">Unlocked Coding</span>?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover the features that make us the preferred choice for learning modern programming skills.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Comprehensive Course Library</h3>
                <p className="text-muted-foreground">
                  Access a diverse collection of programming courses covering web development, mobile apps, data science, and more. Each course is carefully curated with real-world projects and hands-on exercises.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Expert-Led Instruction</h3>
                <p className="text-muted-foreground">
                  Learn from experienced developers and industry professionals. Our platform supports both admin-created content and approved teacher contributions, ensuring quality education from multiple perspectives.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Smart Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor your learning journey with detailed progress tracking. See completion rates, track completed lessons, and get insights into your learning patterns to optimize your study time.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Community & Reviews</h3>
                <p className="text-muted-foreground">
                  Engage with fellow learners through comments and course reviews. Share insights, ask questions, and learn from the experiences of others in our growing community of developers.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Advanced Learning Tools</h3>
                <p className="text-muted-foreground">
                  Enjoy seamless learning with our high-quality video player, interactive lessons, and comprehensive course materials. Access learning objectives, requirements, and structured content designed for optimal retention.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Modern Platform Experience</h3>
                <p className="text-muted-foreground">
                  Experience a responsive, accessible platform with dark/light mode, mobile optimization, and real-time notifications. Built with modern web technologies for the best learning experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section id="featured-courses" className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Popular <span className="text-primary">Categories</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore our most popular programming categories and find the perfect path for your learning journey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoriesLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
                    <div className="h-48 w-full bg-muted animate-pulse"></div>
                    <div className="p-8">
                      <div className="h-6 w-3/4 bg-muted animate-pulse"></div>
                      <div className="mt-4 h-16 bg-muted animate-pulse"></div>
                      <div className="mt-6 h-4 w-1/3 bg-muted animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : categories && categories.length > 0 ? (
                categories.slice(0, 3).map((category: Category) => (
                  <div key={category.id || Math.random()} className="group relative bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out">
                    <div className="h-48 w-full overflow-hidden">
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      />
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-foreground mb-4">
                        <Link href={`/r/${category.slug}`}>
                          <a className="hover:text-primary transition-colors">{category.name}</a>
                        </Link>
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {category.description}
                      </p>
                      <Link href={`/r/${category.slug}`}>
                        <a className="inline-flex items-center text-primary hover:text-primary/80 font-semibold transition-colors">
                          Explore category
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">No categories found</p>
                </div>
              )}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                <Link href="/r">
                  View All Categories
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Your Learning <span className="text-primary">Journey</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Follow these simple steps to start your coding journey and transform your career.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">1. Explore & Choose</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Browse through our diverse range of programming categories and find the perfect fit for your interests and career goals.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">2. Learn & Practice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dive into expert-led courses with hands-on projects, real-world examples, and interactive exercises.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">3. Build & Grow</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complete projects, earn certificates, and build a portfolio that showcases your new skills to employers.
                </p>
              </div>
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-blue-600">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Join thousands of students who have already unlocked their coding potential and built successful tech careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="secondary" size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                <Link href="/auth?tab=register">
                  Start Your Journey
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="/r">
                  Browse All Courses
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
