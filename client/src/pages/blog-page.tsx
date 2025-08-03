import React from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { 
  BookOpen,
  Clock,
  ArrowLeft
} from "lucide-react";

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Coming Soon Section */}
        <section className="relative bg-background py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl mb-6">
                Blog <span className="text-primary">Coming Soon</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                We're working hard to bring you amazing programming insights, tutorials, and industry updates. 
                Our blog will be launching soon with expert content to help you stay ahead in your coding journey.
              </p>
              <div className="flex items-center justify-center gap-4 text-muted-foreground mb-12">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Stay tuned for updates</span>
                </div>
              </div>
              <Button asChild size="lg" className="rounded-md">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
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