import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, User, Mail, Calendar, MessageSquare } from 'lucide-react';

interface TeacherApplication {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'teacher' | 'admin';
  teacherApprovalStatus: 'pending' | 'approved' | 'rejected';
  teacherApprovalDate?: string;
  teacherApprovedBy?: string;
  teacherRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface TeacherStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const ManageTeachers: React.FC = () => {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [stats, setStats] = useState<TeacherStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<TeacherApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/teacher-applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setStats(data.stats);
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teacher applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/teacher-applications/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Teacher application approved successfully",
        });
        fetchApplications();
        setApprovalDialogOpen(false);
      } else {
        throw new Error('Failed to approve application');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve teacher application",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/teacher-applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Teacher application rejected successfully",
        });
        fetchApplications();
        setRejectionDialogOpen(false);
        setRejectionReason('');
      } else {
        throw new Error('Failed to reject application');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject teacher application",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Teacher Applications</h1>
          <p className="text-muted-foreground">
            Review and manage teacher role applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search by username, name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Applications List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ApplicationsList 
            applications={filteredApplications}
            onApprove={(app) => {
              setSelectedApplication(app);
              setApprovalDialogOpen(true);
            }}
            onReject={(app) => {
              setSelectedApplication(app);
              setRejectionDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <ApplicationsList 
            applications={filteredApplications.filter(app => app.teacherApprovalStatus === 'pending')}
            onApprove={(app) => {
              setSelectedApplication(app);
              setApprovalDialogOpen(true);
            }}
            onReject={(app) => {
              setSelectedApplication(app);
              setRejectionDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ApplicationsList 
            applications={filteredApplications.filter(app => app.teacherApprovalStatus === 'approved')}
            onApprove={() => {}}
            onReject={() => {}}
            readOnly
          />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <ApplicationsList 
            applications={filteredApplications.filter(app => app.teacherApprovalStatus === 'rejected')}
            onApprove={() => {}}
            onReject={() => {}}
            readOnly
          />
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Teacher Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this teacher application? 
              The user will be able to create and manage courses.
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedApplication.avatar} />
                  <AvatarFallback>{selectedApplication.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedApplication.fullName || selectedApplication.username}</p>
                  <p className="text-sm text-muted-foreground">@{selectedApplication.username}</p>
                </div>
              </div>
              {selectedApplication.bio && (
                <div>
                  <p className="text-sm font-medium">Bio:</p>
                  <p className="text-sm text-muted-foreground">{selectedApplication.bio}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedApplication && handleApprove(selectedApplication._id)}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Teacher Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. 
              This will be communicated to the user.
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedApplication.avatar} />
                  <AvatarFallback>{selectedApplication.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedApplication.fullName || selectedApplication.username}</p>
                  <p className="text-sm text-muted-foreground">@{selectedApplication.username}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedApplication && handleReject(selectedApplication._id)}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ApplicationsListProps {
  applications: TeacherApplication[];
  onApprove: (app: TeacherApplication) => void;
  onReject: (app: TeacherApplication) => void;
  readOnly?: boolean;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({ applications, onApprove, onReject, readOnly = false }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No applications found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application._id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={application.avatar} />
                  <AvatarFallback>{application.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold">{application.fullName || application.username}</h3>
                    <p className="text-sm text-muted-foreground">@{application.username}</p>
                    {application.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {application.email}
                      </p>
                    )}
                  </div>
                  {application.bio && (
                    <p className="text-sm text-muted-foreground">{application.bio}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(application.teacherApprovalStatus)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Applied {formatDate(application.createdAt)}
                    </span>
                  </div>
                  {application.teacherRejectionReason && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600">Rejection Reason:</p>
                      <p className="text-sm text-muted-foreground">{application.teacherRejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
              {!readOnly && application.teacherApprovalStatus === 'pending' && (
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove(application)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(application)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManageTeachers; 