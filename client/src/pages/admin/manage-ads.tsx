import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  TrendingUp,
  Users,
  MousePointer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Ad {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  position: 'categories' | 'courses';
  order: number;
  isActive: boolean;
  clickCount: number;
  loggedInClickCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AdStats {
  overall: {
    totalAds: number;
    activeAds: number;
    totalClicks: number;
    totalLoggedInClicks: number;
    avgClicksPerAd: number;
  };
  byPosition: Array<{
    _id: string;
    count: number;
    totalClicks: number;
    loggedInClicks: number;
  }>;
}

export default function ManageAdsPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'categories' as 'categories' | 'courses',
    order: 1,
    isActive: true
  });

  // Fetch ads
  const { data: ads = [], isLoading } = useQuery<Ad[]>({
    queryKey: ['/api/ads'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/ads');
      return res.json();
    },
  });

  // Fetch stats
  const { data: stats } = useQuery<AdStats>({
    queryKey: ['/api/ads/stats/overview'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/ads/stats/overview');
      return res.json();
    },
  });

  // Create/Update ad mutation
  const adMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editingAd ? 'PUT' : 'POST';
      const url = editingAd ? `/api/ads/${editingAd._id}` : '/api/ads';
      const res = await apiRequest(method, url, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads/stats/overview'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingAd ? 'Ad Updated' : 'Ad Created',
        description: editingAd ? 'Ad has been updated successfully.' : 'New ad has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.error || 'Failed to save ad',
        variant: 'destructive',
      });
    },
  });

  // Delete ad mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/ads/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads/stats/overview'] });
      toast({
        title: 'Ad Deleted',
        description: 'Ad has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.error || 'Failed to delete ad',
        variant: 'destructive',
      });
    },
  });

  // Toggle ad status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest('PUT', `/api/ads/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ads/stats/overview'] });
      toast({
        title: 'Status Updated',
        description: 'Ad status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.error || 'Failed to update ad status',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'categories',
      order: 1,
      isActive: true
    });
    setEditingAd(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adMutation.mutate(formData);
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      name: ad.name,
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      position: ad.position,
      order: ad.order,
      isActive: ad.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Manage Advertisements</h1>
            <p className="text-muted-foreground">
              Create and manage advertisements that appear between categories and courses
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overall.totalAds}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.overall.activeAds} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overall.totalClicks}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.overall.avgClicksPerAd.toFixed(1)} avg per ad
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Logged-in Clicks</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overall.totalLoggedInClicks}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.overall.totalClicks > 0 
                      ? `${((stats.overall.totalLoggedInClicks / stats.overall.totalClicks) * 100).toFixed(1)}%`
                      : '0%'
                    } of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.overall.totalAds > 0 
                      ? (stats.overall.totalClicks / stats.overall.totalAds).toFixed(1)
                      : '0'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    clicks per ad
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Create Ad Button */}
          <div className="mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Ad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAd 
                      ? 'Update the advertisement details below.'
                      : 'Create a new advertisement that will appear between categories or courses.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter ad name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Select
                        value={formData.position}
                        onValueChange={(value: 'categories' | 'courses') => 
                          setFormData({ ...formData, position: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="categories">Between Categories</SelectItem>
                          <SelectItem value="courses">Between Courses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter a detailed description of the advertisement..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">Link URL</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        min="1"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={adMutation.isPending}>
                      {adMutation.isPending ? 'Saving...' : (editingAd ? 'Update' : 'Create')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Ads Table */}
          <Card>
            <CardHeader>
              <CardTitle>Advertisements</CardTitle>
              <CardDescription>
                Manage your advertisements and view performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : ads.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Advertisements</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first advertisement to start monetizing your platform.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Ad
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Logged-in Clicks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad) => (
                      <TableRow key={ad._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={ad.imageUrl}
                              alt={ad.name}
                              className="w-12 h-8 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{ad.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {ad.linkUrl}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {ad.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{ad.position}</span>
                        </TableCell>
                        <TableCell>{ad.order}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(ad._id, ad.isActive)}
                            disabled={toggleStatusMutation.isPending}
                          >
                            {ad.isActive ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{ad.clickCount}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{ad.loggedInClickCount}</div>
                            {ad.clickCount > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {((ad.loggedInClickCount / ad.clickCount) * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(ad)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(ad.linkUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(ad._id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
} 