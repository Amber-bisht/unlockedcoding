import React from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, TrendingUp, Building2 } from "lucide-react";

export default function CareerPage() {
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
                  <Building2 className="w-4 h-4 mr-2" />
                  Join Our Team
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6">
                <span className="block">Career</span>
                <span className="block text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Opportunities</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Build the future of education technology with us. We're looking for passionate individuals 
                who want to make a difference in the world of online learning.
              </p>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Clock className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Coming <span className="text-primary">Soon</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We're currently building our career opportunities page. Check back soon for exciting job openings 
                and internship opportunities at Unlocked Coding.
              </p>
            </div>

            {/* What We're Looking For */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Passionate Developers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Join our team of experienced developers building cutting-edge educational technology.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Growth Mindset</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We value continuous learning and innovation in everything we do.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Remote First</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Work from anywhere in the world with our flexible remote-first culture.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Contact CTA */}
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-6">
                Interested in joining our team? Send us your resume and cover letter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg font-semibold">
                  <Link href="/">
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
} 