import React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mail,
  Send,
  MessageSquare,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  FileText,
  Check,
  Copy
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CopyrightPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "copyright_infringement" as "copyright_infringement" | "trademark_violation" | "other",
    disputeLink: "",
    agencyName: "",
    agencyRepresentative: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/copyright/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setTicketId(result.data.ticketId);
        setShowTicketDialog(true);
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          reason: "copyright_infringement",
          disputeLink: "",
          agencyName: "",
          agencyRepresentative: "",
          message: ""
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit dispute');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Failed to submit dispute",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const copyTicketId = async () => {
    try {
      await navigator.clipboard.writeText(ticketId);
      toast({
        title: "Ticket ID copied!",
        description: "Ticket ID has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the ticket ID.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-background py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
                Copyright <span className="text-primary">Dispute</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
                Submit a copyright dispute or report content that violates intellectual property rights.
              </p>
            </div>
          </div>
        </section>

        {/* Important Notice Section */}
        <section className="py-8 bg-amber-50 dark:bg-amber-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Important Platform Notice
                  </h3>
                  <div className="text-amber-700 dark:text-amber-300 space-y-2">
                    <p>
                      <strong>This is a platform, not a single-person owned site.</strong> Only teachers and admins can add or manage courses. 
                      We are not taking responsibility for individual course content.
                    </p>
                    <p>
                      <strong>Response Time:</strong> We will review your request within 24 hours and modify or remove content based on your request within 48 hours maximum.
                    </p>
                    <p>
                      <strong>Process:</strong> Based on the ticket raised, our moderating team will review and notify you of the outcome.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Copyright Form Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Submit Copyright Dispute</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email (Logged in) *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reason" className="text-foreground">Reason for Dispute *</Label>
                  <Select name="reason" value={formData.reason} onValueChange={(value) => setFormData({...formData, reason: value as any})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="copyright_infringement">Copyright Infringement</SelectItem>
                      <SelectItem value="trademark_violation">Trademark Violation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="disputeLink" className="text-foreground">Link of Dispute *</Label>
                  <Input
                    id="disputeLink"
                    name="disputeLink"
                    type="url"
                    value={formData.disputeLink}
                    onChange={handleChange}
                    required
                    className="mt-2"
                    placeholder="https://example.com/course-link"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="agencyName" className="text-foreground">Agency Name</Label>
                    <Input
                      id="agencyName"
                      name="agencyName"
                      type="text"
                      value={formData.agencyName}
                      onChange={handleChange}
                      className="mt-2"
                      placeholder="Your agency name (if applicable)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agencyRepresentative" className="text-foreground">Representative of Agency</Label>
                    <Input
                      id="agencyRepresentative"
                      name="agencyRepresentative"
                      type="text"
                      value={formData.agencyRepresentative}
                      onChange={handleChange}
                      className="mt-2"
                      placeholder="Representative name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-foreground">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-2 min-h-[120px]"
                    placeholder="Please provide detailed information about your copyright dispute..."
                  />
                </div>
                
                <Button type="submit" className="w-full rounded-md" disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Dispute"}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Process Information Section */}
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Our Copyright Dispute Process
              </h2>
              <p className="text-lg text-muted-foreground">
                How we handle copyright disputes and protect intellectual property
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">24 Hour Review</h3>
                <p className="text-muted-foreground">
                  We review all copyright disputes within 24 hours of submission
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">48 Hour Action</h3>
                <p className="text-muted-foreground">
                  Content modification or removal completed within 48 hours maximum
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Expert Review</h3>
                <p className="text-muted-foreground">
                  Our moderating team carefully reviews each dispute case
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ticket Status Tracking Section */}
        <section id="ticket-status-section" className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Track Your Ticket Status
              </h2>
              <p className="text-lg text-muted-foreground">
                Check the status of your copyright dispute ticket
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Ticket Status Checker</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Enter your ticket ID to check the current status of your copyright dispute
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter your Ticket ID (e.g., TKT-1234567890-ABC123)"
                    className="flex-1"
                    id="ticketId"
                  />
                  <Button onClick={() => {
                    const ticketId = (document.getElementById('ticketId') as HTMLInputElement)?.value;
                    if (ticketId) {
                      window.open(`/api/copyright/status/${ticketId}`, '_blank');
                    }
                  }}>
                    Check Status
                  </Button>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-1">How to track your ticket:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Enter your ticket ID in the field above</li>
                        <li>• Click "Check Status" to view current status</li>
                        <li>• Status will open in a new tab</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Need Additional Help?
              </h2>
              <p className="text-lg text-muted-foreground">
                Contact us through our official channels
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Telegram Support</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Get direct support through our Telegram channels
              </p>
              <div className="space-y-2">
                <a href="https://t.me/unlocked_devs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">
                  @unlocked_devs - Direct Support
                </a>
                <a href="https://t.me/unlocked_coding" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block">
                  @unlocked_coding - Main Channel
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Ticket Success Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              Ticket Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your copyright dispute has been submitted. Please save your ticket ID for tracking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Your Ticket ID
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted px-3 py-2 rounded-md border">
                  <code className="text-sm font-mono select-all">{ticketId}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTicketId}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• We will review your request within 24 hours</li>
                    <li>• You can track your ticket status using this ID</li>
                    <li>• Keep this ticket ID safe for future reference</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowTicketDialog(false)}
                className="flex-1"
              >
                Got it
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowTicketDialog(false);
                  // Scroll to ticket status section
                  document.getElementById('ticket-status-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Track Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
} 