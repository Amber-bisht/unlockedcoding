import React from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Award, 
  Target, 
  Globe,
  BookOpen,
  Code,
  CheckCircle,
  Star
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-background py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
                About <span className="text-primary">Unlocked Coding</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
                Empowering individuals to unlock their potential through comprehensive programming education and hands-on learning experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  At Unlocked Coding, we believe that everyone deserves access to high-quality programming education. Our mission is to democratize coding knowledge and help individuals from all backgrounds build successful careers in technology.
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  We combine expert instruction, practical projects, and a supportive community to create an unparalleled learning experience that transforms beginners into confident developers.
                </p>
                <Button asChild size="lg" className="rounded-md">
                  <Link href="/r">
                    Explore Our Courses
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="bg-primary/10 rounded-lg p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">37,000+</h3>
                      <p className="text-sm text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">220+</h3>
                      <p className="text-sm text-muted-foreground">Courses</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Award className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">95%</h3>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Globe className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">10+</h3>
                      <p className="text-sm text-muted-foreground">Countries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Our Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These core values guide everything we do at Unlocked Coding
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Excellence
                </h3>
                <p className="text-muted-foreground">
                  We maintain the highest standards in our curriculum, instruction, and student support to ensure exceptional learning outcomes.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Community
                </h3>
                <p className="text-muted-foreground">
                  We foster a supportive, inclusive community where learners can connect, collaborate, and grow together.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Innovation
                </h3>
                <p className="text-muted-foreground">
                  We continuously evolve our teaching methods and content to stay ahead of industry trends and technology changes.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Accessibility
                </h3>
                <p className="text-muted-foreground">
                  We believe quality education should be accessible to everyone, regardless of their background or location.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Quality
                </h3>
                <p className="text-muted-foreground">
                  Every course, lesson, and resource is carefully crafted to provide the best possible learning experience.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Global Impact
                </h3>
                <p className="text-muted-foreground">
                  We're committed to making a positive impact on the global tech community by empowering the next generation of developers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Meet Our Founder
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The passionate developer behind Unlocked Coding, dedicated to creating an exceptional learning platform
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="text-center max-w-md">
                <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden">
                  <img 
                    src="/photo_5780652181278541954_x.jpg" 
                    alt="@unlocked_devs" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">@unlocked_devs</h3>
                <p className="text-primary font-medium mb-3">Founder, CEO & Developer</p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  The creator and developer of this platform, passionate about democratizing programming education and empowering learners worldwide to unlock their coding potential.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have transformed their careers with Unlocked Coding
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" size="lg" className="rounded-md">
                <Link href="/auth?tab=register">
                  Get Started Today
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white border-transparent hover:border-transparent">
                <Link href="/r">
                  Browse Courses
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