import React from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Eye, 
  MousePointer, 
  Globe, 
  Zap,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  ExternalLink
} from "lucide-react";

export default function AdsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-background via-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Advertising Opportunities
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6">
                <span className="block">Advertise on</span>
                <span className="block text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Unlocked Coding</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Reach thousands of developers, students, and tech professionals who are actively 
                learning and growing their skills. Our platform offers targeted advertising solutions 
                to help your brand connect with the right audience.
              </p>
            </div>
          </div>
        </section>

        {/* Audience Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Our <span className="text-primary">Audience</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Connect with a highly engaged community of tech learners and professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">37,000+</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Active learners and developers
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">7+</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Countries worldwide
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Tech-Focused</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Programming and development audience
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">High Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Active learning community
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Ad Formats Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Advertising <span className="text-primary">Options</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Choose from our targeted advertising options. Contact us via Telegram for pricing and setup.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <MousePointer className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Course/Category Ads</CardTitle>
                  <CardDescription>
                    Targeted ads based on clicks (logged & non-logged users)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Placement</span>
                      <Badge variant="secondary">Course Pages, Categories</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pricing</span>
                      <Badge variant="secondary">Per Click</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <Badge variant="secondary">DM @unlocked_devs</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Notification Ads</CardTitle>
                  <CardDescription>
                    Fixed cost notification advertisements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Placement</span>
                      <Badge variant="secondary">Notification Tab</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pricing</span>
                      <Badge variant="secondary">Fixed Cost</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <Badge variant="secondary">DM @unlocked_devs</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Telegram Channel</CardTitle>
                  <CardDescription>
                    Promotional posts in our Telegram channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Placement</span>
                      <Badge variant="secondary">Telegram Channel</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Format</span>
                      <Badge variant="secondary">Promotional Posts</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <Badge variant="secondary">DM @unlocked_devs</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Book Now Section */}
            <div className="mt-12 text-center">
              <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                <a 
                  href="https://t.me/unlocked_devs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Book Now
                  <ExternalLink className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Why <span className="text-primary">Advertise</span> With Us?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover the advantages of advertising on our platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Targeted Audience</h3>
                    <p className="text-muted-foreground">Reach developers, students, and tech professionals who are actively learning and making purchasing decisions.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">High Engagement</h3>
                    <p className="text-muted-foreground">Our audience is highly engaged with long session times and frequent return visits.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Global Reach</h3>
                    <p className="text-muted-foreground">Access a diverse, international audience from over 7 countries worldwide.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Detailed Analytics</h3>
                    <p className="text-muted-foreground">Get comprehensive reports on impressions, clicks, and conversions for your campaigns.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Competitive Pricing</h3>
                    <p className="text-muted-foreground">Affordable advertising rates with flexible campaign options to fit your budget.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Dedicated Support</h3>
                    <p className="text-muted-foreground">Personal account management and support to help optimize your campaigns.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-blue-600">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Start Advertising?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Connect with our advertising team to discuss your campaign goals and get started today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="secondary" size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                <Link href="/copyright">
                  <Mail className="w-5 h-5 mr-2" />
                  Copyright Issues
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="/copyright">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Report Issues
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