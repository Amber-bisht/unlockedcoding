import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Badge,
  BadgeProps,
} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Textarea,
} from "@/components/ui/textarea";
import {
  ArrowLeft,
  MessageCircle,
  Eye,
  Check,
  Trash2,
  Mail,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  ExternalLink,
  Clock,
  Shield,
} from "lucide-react";

interface CopyrightTicket {
  _id: string;
  ticketId: string;
  name: string;
  email: string;
  reason: 'copyright_infringement' | 'trademark_violation' | 'other';
  disputeLink: string;
  agencyName?: string;
  agencyRepresentative?: string;
  message: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const statusBadgeVariants: Record<string, BadgeProps['variant']> = {
  pending: 'destructive',
  reviewing: 'secondary',
  resolved: 'default',
  rejected: 'outline',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const reasonLabels: Record<string, string> = {
  copyright_infringement: 'Copyright Infringement',
  trademark_violation: 'Trademark Violation',
  other: 'Other',
};

export default function CopyrightTicketsPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<CopyrightTicket | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');

  // Temporarily disabled admin check during development
  /*useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);*/

  const { data: tickets, isLoading } = useQuery<CopyrightTicket[]>({
    queryKey: ["/api/admin/copyright-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/copyright-tickets");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status, adminNotes }: { ticketId: string; status: string; adminNotes?: string }) => {
      const res = await fetch(`/api/admin/copyright-tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/copyright-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await fetch(`/api/admin/copyright-tickets/${ticketId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete ticket');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/copyright-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
    },
  });

  const handleViewTicket = (ticket: CopyrightTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setAdminNotes(ticket.adminNotes || '');
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedTicket && newStatus) {
      updateStatusMutation.mutate({
        ticketId: selectedTicket._id,
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });
      setIsViewDialogOpen(false);
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      deleteMutation.mutate(ticketId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingCount = tickets?.filter(t => t.status === 'pending').length || 0;
  const reviewingCount = tickets?.filter(t => t.status === 'reviewing').length || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <div className="flex items-center mb-2">
                <Button asChild variant="ghost" size="sm" className="mr-4">
                  <Link href="/admin/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Copyright Dispute Tickets</h1>
              <p className="text-muted-foreground mt-1">
                Manage copyright dispute tickets and status updates
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              {pendingCount > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {pendingCount} pending
                </Badge>
              )}
              {reviewingCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {reviewingCount} reviewing
                </Badge>
              )}
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Copyright Tickets</CardTitle>
              <CardDescription>
                View and manage copyright dispute tickets with status updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow 
                          key={ticket._id}
                          className={ticket.status === 'pending' ? 'bg-red-50' : ''}
                        >
                          <TableCell>
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {ticket.ticketId}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={statusBadgeVariants[ticket.status]}
                              className="text-xs"
                            >
                              {statusLabels[ticket.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              {ticket.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              {ticket.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {reasonLabels[ticket.reason]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {formatDate(ticket.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTicket(ticket)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTicket(ticket._id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Copyright Tickets</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    There are no copyright dispute tickets to display at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* View Ticket Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Copyright Ticket Details
            </DialogTitle>
            <DialogDescription>
              View and update the status of this copyright dispute ticket
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ticket ID</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{selectedTicket.ticketId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={statusBadgeVariants[selectedTicket.status]}>
                    {statusLabels[selectedTicket.status]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{selectedTicket.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{selectedTicket.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reason</label>
                  <Badge variant="outline">{reasonLabels[selectedTicket.reason]}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dispute Link</label>
                  <a 
                    href={selectedTicket.disputeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Link
                  </a>
                </div>
              </div>

              {(selectedTicket.agencyName || selectedTicket.agencyRepresentative) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTicket.agencyName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Agency Name</label>
                      <p className="text-sm">{selectedTicket.agencyName}</p>
                    </div>
                  )}
                  {selectedTicket.agencyRepresentative && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Representative</label>
                      <p className="text-sm">{selectedTicket.agencyRepresentative}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{formatDate(selectedTicket.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{formatDate(selectedTicket.updatedAt)}</p>
                </div>
              </div>

              {selectedTicket.resolvedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resolved</label>
                  <p className="text-sm">{formatDate(selectedTicket.resolvedAt)}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-muted-foreground">Update Status</label>
                <div className="mt-2 space-y-4">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add admin notes (optional)"
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={updateStatusMutation.isPending || !newStatus}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsViewDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
} 