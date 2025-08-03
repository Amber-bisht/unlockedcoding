import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  AlertTriangle,
  Loader2,
  Check,
  Clock,
  FileText,
  DollarSign,
  Target,
  Bookmark,
  ListChecks,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { Course, InsertCourse, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isYouTubeVideo, isYouTubePlaylist, parseBulkYouTubeLinks, validateYouTubeLink } from "@/lib/youtube-utils";

const courseFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(5, "Slug must be at least 5 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens and no spaces"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  longDescription: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid URL"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().min(0).nullable(),
  originalPrice: z.number().min(0).nullable(),
  duration: z.string().min(1, "Duration is required"),
  learningObjectives: z.array(z.string()),
  requirements: z.array(z.string()),
  targetAudience: z.array(z.string()),
  videoLinks: z.array(z.object({
    title: z.string().min(1, "Video title is required"),
    url: z.string().url("Must be a valid URL")
  })).optional(),
  videoLinksBulk: z.string().optional(),
  lessonCount: z.number().min(0).optional(),
  enrollmentLink: z.string().url("Please enter a valid enrollment link").optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const lessonFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  position: z.number().int().min(1, "Position must be at least 1"),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

export default function ManageCourses() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return res.json();
    },
  });

  const { data: courses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses");
      return res.json();
    },
  });

  const { data: lessons, isLoading: isLessonsLoading } = useQuery<any[]>({
    queryKey: [`/api/courses/${selectedCourse?.id}/lessons`],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${selectedCourse?.id}/lessons`);
      return res.json();
    },
    enabled: !!selectedCourse,
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormValues) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Course created",
        description: "The course has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CourseFormValues }) => {
      const res = await apiRequest("PUT", `/api/courses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditCourse(null);
      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setDeleteCourse(null);
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async ({ courseId, data }: { courseId: number; data: LessonFormValues }) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/lessons`, data);
      return res.json();
    },
    onSuccess: () => {
      if (selectedCourse) {
        queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourse.id}/lessons`] });
        queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      }
      setIsLessonDialogOpen(false);
      lessonForm.reset({
        title: "",
        description: "",
        content: "",
        videoUrl: "",
        duration: "",
        position: (lessons?.length || 0) + 1,
      });
      toast({
        title: "Lesson created",
        description: "The lesson has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create lesson",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      longDescription: "",
      imageUrl: "",
      categoryId: "",
      price: null,
      originalPrice: null,
      duration: "",
      learningObjectives: [],
      requirements: [],
      targetAudience: [],
      videoLinks: [],
      videoLinksBulk: "",
      enrollmentLink: "",
    },
  });

  const editForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: editCourse?.title || "",
      slug: editCourse?.slug || "",
      description: editCourse?.description || "",
      longDescription: editCourse?.longDescription || "",
      imageUrl: editCourse?.imageUrl || "",
      categoryId: editCourse?.categoryId ? String(editCourse.categoryId) : "",
      price: editCourse?.price || null,
      originalPrice: editCourse?.originalPrice || null,
      duration: editCourse?.duration || "",
      learningObjectives: editCourse?.learningObjectives || [],
      requirements: editCourse?.requirements || [],
      targetAudience: editCourse?.targetAudience || [],
      videoLinks: editCourse?.videoLinks || [],
      videoLinksBulk: "",
      enrollmentLink: editCourse?.enrollmentLink || "",
    },
  });

  const lessonForm = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      duration: "",
      position: (lessons?.length || 0) + 1,
    },
  });

  // Reset edit form when editCourse changes
  useEffect(() => {
    if (editCourse) {
      // Convert existing video links to bulk format
      const bulkVideoLinks = editCourse.videoLinks?.map(link => `${link.title}:${link.url}`).join('\n') || '';
      
      editForm.reset({
        title: editCourse.title,
        slug: editCourse.slug,
        description: editCourse.description,
        longDescription: editCourse.longDescription || "",
        imageUrl: editCourse.imageUrl,
        categoryId: String(editCourse.categoryId),
        price: editCourse.price || null,
        originalPrice: editCourse.originalPrice || null,
        duration: editCourse.duration,
        learningObjectives: editCourse.learningObjectives || [],
        requirements: editCourse.requirements || [],
        targetAudience: editCourse.targetAudience || [],
        videoLinks: editCourse.videoLinks || [],
        videoLinksBulk: bulkVideoLinks,
        enrollmentLink: editCourse.enrollmentLink || "",
      });
    }
  }, [editCourse, editForm]);

  // Update lesson form position when lessons change
  useEffect(() => {
    if (lessons) {
      lessonForm.setValue("position", (lessons.length || 0) + 1);
    }
  }, [lessons, lessonForm]);

  const onCreateSubmit = (data: CourseFormValues) => {
    createCourseMutation.mutate(data);
  };

  const onEditSubmit = (data: CourseFormValues) => {
    if (editCourse) {
      updateCourseMutation.mutate({ id: editCourse.id, data });
    }
  };

  const onLessonSubmit = (data: LessonFormValues) => {
    if (selectedCourse) {
      createLessonMutation.mutate({ courseId: selectedCourse.id, data });
    }
  };

  const handleDelete = () => {
    if (deleteCourse) {
      deleteCourseMutation.mutate(deleteCourse.id);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, form: typeof createForm) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    // Only auto-generate slug if slug field is empty or matches the previous auto-generated slug
    const currentSlug = form.getValues("slug");
    const slugFromTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    if (!currentSlug || currentSlug === form.getValues("title").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) {
      form.setValue("slug", slugFromTitle);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="text-center py-12">
              <CardHeader>
                <div className="mx-auto">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                </div>
                <CardTitle className="mt-4">Access Denied</CardTitle>
                <CardDescription>
                  You don't have permission to access this page.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Link href="/admin">
                <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to dashboard
                </a>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
              <p className="text-muted-foreground mt-1">
                Create, edit and manage your course catalog
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                      Add a new course to your platform
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-4">
                      <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="basic">Basic Info</TabsTrigger>
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="requirements">Requirements</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic" className="space-y-4 mt-4">
                          <FormField
                            control={createForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Course Title *</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g. Introduction to Web Development"
                                    onChange={(e) => handleTitleChange(e, createForm)} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  The name of your course
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g. introduction-to-web-development"
                                  />
                                </FormControl>
                                <FormDescription>
                                  The URL-friendly version of the title
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category *</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {isCategoriesLoading ? (
                                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                                    ) : categories && categories.length > 0 ? (
                                      categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                          {category.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="none" disabled>No categories available</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  The category this course belongs to
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cover Image URL *</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="https://example.com/image.jpg"
                                  />
                                </FormControl>
                                <FormDescription>
                                  URL to an image representing this course
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="enrollmentLink"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Enrollment Link</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://example.com/enroll" />
                                </FormControl>
                                <FormDescription>
                                  URL where users can enroll in this course (optional)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={createForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price ($) *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="e.g. 49.99"
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Course price (leave empty for free)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="originalPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Original Price ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="e.g. 99.99"
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Original price (for discounts)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={createForm.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="e.g. 10 hours"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Total course duration
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="details" className="space-y-4 mt-4">
                          <FormField
                            control={createForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Short Description *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="A brief overview of the course"
                                    rows={3}
                                  />
                                </FormControl>
                                <FormDescription>
                                  A short summary that appears in course listings
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="longDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Long Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Detailed description of the course content"
                                    rows={6}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Detailed description shown on the course page
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                        
                        <TabsContent value="requirements" className="space-y-4 mt-4">
                          <FormField
                            control={createForm.control}
                            name="learningObjectives"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Learning Objectives</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    value={(field.value || []).join('\n')}
                                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                                    placeholder="What students will learn (one per line)
Example: Build responsive websites
Example: Master JavaScript fundamentals"
                                    rows={4}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter one learning objective per line
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="requirements"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Requirements</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    value={(field.value || []).join('\n')}
                                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                                    placeholder="Prerequisites for taking this course (one per line)
Example: Basic computer skills
Example: Understanding of HTML basics"
                                    rows={4}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter one requirement per line
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="targetAudience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Audience</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    value={(field.value || []).join('\n')}
                                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                                    placeholder="Who this course is for (one per line)
Example: Beginners interested in web development
Example: Students looking to enhance their coding skills"
                                    rows={4}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter one audience type per line
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Video Links</h3>
                            <p className="text-sm text-muted-foreground">
                              Add video links in bulk format: title:url (one per line)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const sampleLinks = `Day 1 - CMake:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1193619-1726315111/hls-f70dbe/1080p/master-5433579.570721215.m3u8
Day 2 - CMake, Shared and Static Library:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1195919-1726437879/hls-644aa0/1080p/master-2659178.9647363997.m3u8
Day 3 - STL:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1217017-1726919731/hls-ccddde/1080p/master-7522104.162709313.m3u8
Day 4 - Multithreading Part 1:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1219122-1727040153/hls-f16973/1080p/master-4765006.806706904.m3u8
Day 5 - Multithreading Part 2:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1241249-1727554414/hls-35a8e0/1080p/master-517792.4569099468.m3u8
Day 6 - Lock Free Programming:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1242322-1727650533/hls-736972/1080p/master-4842244.15949457.m3u8
Day 7 - Networking Basics Part 1:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1264658-1728136354/hls-5b8fac/1080p/master-2601952.099242988.m3u8
Day 8 - Advanced Networking - epoll:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1266641-1728259831/hls-b14823/1080p/master-7995708.677757937.m3u8
Day 9 - HTTP Server Implementation:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1287329-1728803440/hls-f0d00c/1080p/master-9992366.51117968.m3u8
Day 10 - HTTPS Implementation:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1287565-1729148689/hls-74de6a/1080p/master-7847308.897487031.m3u8
Day 11 - Websockets and WebRTC:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1313027-1729361796/hls-7b1e6a/1080p/master-5601829.756218366.m3u8
Day 12 - io_uring iocp:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1314407-1729437578/hls-e2c56d/1080p/master-252606.7000582577.m3u8`;
                              createForm.setValue("videoLinksBulk", sampleLinks);
                            }}
                          >
                            Add Sample Videos
                          </Button>
                        </div>
                        
                        <FormField
                          control={createForm.control}
                          name="videoLinksBulk"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video Links (Bulk Input)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter video links (one per line)
Examples:
Day 1 - Introduction:https://example.com/video1.m3u8
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/playlist?list=PLAYLIST_ID"
                                  className="min-h-32 font-mono text-sm"
                                  {...field}
                                  onChange={async (e) => {
                                    field.onChange(e);
                                    // Parse the bulk input using the new utility function
                                    const parsedLinks = parseBulkYouTubeLinks(e.target.value);
                                    
                                    // Validate YouTube links
                                    const validLinks = parsedLinks.filter(link => validateYouTubeLink(link));
                                    const invalidLinks = parsedLinks.filter(link => !validateYouTubeLink(link));
                                    
                                    // Update the form with valid links
                                    createForm.setValue("videoLinks", validLinks);
                                    
                                    // Show feedback about parsing results
                                    if (invalidLinks.length > 0) {
                                      toast({
                                        title: "Parsing Complete",
                                        description: `Parsed ${parsedLinks.length} links (${validLinks.length} valid, ${invalidLinks.length} invalid YouTube URLs)`,
                                        variant: "destructive",
                                      });
                                    } else if (validLinks.length > 0) {
                                      toast({
                                        title: "Parsing Complete",
                                        description: `Successfully parsed ${validLinks.length} YouTube links`,
                                      });
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter one video link per line. You can use title:url format or just paste raw URLs. YouTube videos and playlists are automatically expanded.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {(() => {
                          const videoLinks = createForm.watch("videoLinks");
                          return videoLinks && videoLinks.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Parsed Videos ({videoLinks.length})</h4>
                                                          <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                                {videoLinks.map((video, index) => (
                                  <div key={index} className="text-xs text-muted-foreground">
                                    <span className="font-medium">{video?.title || ''}</span>
                                    <span className="ml-2">→</span>
                                    <span className="ml-2 truncate">{video?.url || ''}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createCourseMutation.isPending}
                        >
                          {createCourseMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Create Course
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Manage all courses in your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCoursesLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : courses && courses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id || Math.random()}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded overflow-hidden">
                              <img 
                                src={course.imageUrl} 
                                alt={course.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {course.description.length > 60 
                                  ? `${course.description.substring(0, 60)}...` 
                                  : course.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {categories?.find(cat => cat.id === course.categoryId)?.name || "Uncategorized"}
                        </TableCell>
                        <TableCell>
                          {course.price 
                            ? `$${parseFloat(String(course.price)).toFixed(2)}` 
                            : "Free"}
                        </TableCell>
                        <TableCell>
                          {course.lessonCount || 0}
                        </TableCell>
                        <TableCell>
                          {typeof course.rating === 'number' ? course.rating.toFixed(1) : '0.0'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedCourse(course)}>
                              <FileText className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">Lessons</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditCourse(course)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the "{course.title}" course and all its lessons. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => setDeleteCourse(course)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    You haven't created any courses yet. Start by adding your first course.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Course
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />

      {/* Edit Course Dialog */}
      <Dialog open={!!editCourse} onOpenChange={(open) => !open && setEditCourse(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the details for "{editCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Introduction to Web Development"
                            onChange={(e) => handleTitleChange(e, editForm)} 
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. introduction-to-web-development"
                          />
                        </FormControl>
                        <FormDescription>
                          The URL-friendly version of the title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isCategoriesLoading ? (
                              <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                            ) : categories && categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No categories available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The category this course belongs to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://example.com/image.jpg"
                          />
                        </FormControl>
                        <FormDescription>
                          URL to an image representing this course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="enrollmentLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrollment Link</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/enroll" />
                        </FormControl>
                        <FormDescription>
                          URL where users can enroll in this course (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 49.99"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Course price (leave empty for free)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 99.99"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Original price (for discounts)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. 10 hours"
                            />
                          </FormControl>
                          <FormDescription>
                            Total course duration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="A brief overview of the course"
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          A short summary that appears in course listings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Detailed description of the course content"
                            rows={6}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description shown on the course page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <FormField
                    control={editForm.control}
                    name="learningObjectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Objectives</FormLabel>
                        <FormControl>
                          <Textarea 
                            value={(field.value || []).join('\n')}
                            onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                            placeholder="What students will learn (one per line)
Example: Build responsive websites
Example: Master JavaScript fundamentals"
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter one learning objective per line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            value={(field.value || []).join('\n')}
                            onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                            placeholder="Prerequisites for taking this course (one per line)
Example: Basic computer skills
Example: Understanding of HTML basics"
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter one requirement per line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Textarea 
                            value={(field.value || []).join('\n')}
                            onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                            placeholder="Who this course is for (one per line)
Example: Beginners interested in web development
Example: Students looking to enhance their coding skills"
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter one audience type per line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Video Links</h3>
                    <p className="text-sm text-muted-foreground">
                      Add video links in bulk format: title:url (one per line)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const sampleLinks = `Day 1 - CMake:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1193619-1726315111/hls-f70dbe/1080p/master-5433579.570721215.m3u8
Day 2 - CMake, Shared and Static Library:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1195919-1726437879/hls-644aa0/1080p/master-2659178.9647363997.m3u8
Day 3 - STL:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1217017-1726919731/hls-ccddde/1080p/master-7522104.162709313.m3u8
Day 4 - Multithreading Part 1:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1219122-1727040153/hls-f16973/1080p/master-4765006.806706904.m3u8
Day 5 - Multithreading Part 2:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1241249-1727554414/hls-35a8e0/1080p/master-517792.4569099468.m3u8
Day 6 - Lock Free Programming:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1242322-1727650533/hls-736972/1080p/master-4842244.15949457.m3u8
Day 7 - Networking Basics Part 1:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1264658-1728136354/hls-5b8fac/1080p/master-2601952.099242988.m3u8
Day 8 - Advanced Networking - epoll:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1266641-1728259831/hls-b14823/1080p/master-7995708.677757937.m3u8
Day 9 - HTTP Server Implementation:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1287329-1728803440/hls-f0d00c/1080p/master-9992366.51117968.m3u8
Day 10 - HTTPS Implementation:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1287565-1729148689/hls-74de6a/1080p/master-7847308.897487031.m3u8
Day 11 - Websockets and WebRTC:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1313027-1729361796/hls-7b1e6a/1080p/master-5601829.756218366.m3u8
Day 12 - io_uring iocp:https://appx-transcoded-videos-mcdn.akamai.net.in/videos/keertipurswani-data/1314407-1729437578/hls-e2c56d/1080p/master-252606.7000582577.m3u8`;
                      editForm.setValue("videoLinksBulk", sampleLinks);
                    }}
                  >
                    Add Sample Videos
                  </Button>
                </div>
                
                <FormField
                  control={editForm.control}
                  name="videoLinksBulk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Links (Bulk Input)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter video links (one per line)
Examples:
Day 1 - Introduction:https://example.com/video1.m3u8
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/playlist?list=PLAYLIST_ID"
                          className="min-h-32 font-mono text-sm"
                          {...field}
                          onChange={async (e) => {
                            field.onChange(e);
                            // Parse the bulk input using the new utility function
                            const parsedLinks = parseBulkYouTubeLinks(e.target.value);
                            
                            // Validate YouTube links
                            const validLinks = parsedLinks.filter(link => validateYouTubeLink(link));
                            const invalidLinks = parsedLinks.filter(link => !validateYouTubeLink(link));
                            
                            // Update the form with valid links
                            editForm.setValue("videoLinks", validLinks);
                            
                            // Show feedback about parsing results
                            if (invalidLinks.length > 0) {
                              toast({
                                title: "Parsing Complete",
                                description: `Parsed ${parsedLinks.length} links (${validLinks.length} valid, ${invalidLinks.length} invalid YouTube URLs)`,
                                variant: "destructive",
                              });
                            } else if (validLinks.length > 0) {
                              toast({
                                title: "Parsing Complete",
                                description: `Successfully parsed ${validLinks.length} YouTube links`,
                              });
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter one video link per line. You can use title:url format or just paste raw URLs. YouTube videos and playlists are automatically expanded.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {editForm.watch("videoLinks") && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Lesson Count: <b>{editForm.watch("videoLinks")?.length || 0}</b></span>
                  </div>
                )}
                {/* Lesson Count field: enabled if no videoLinks, disabled if videoLinks exist */}
                <FormField
                  control={editForm.control}
                  name="lessonCount"
                  render={({ field }) => {
                    const videoLinks = editForm.watch("videoLinks");
                    const hasVideoLinks = videoLinks && videoLinks.length > 0;
                    
                    return (
                      <FormItem>
                        <FormLabel>Lesson Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            value={hasVideoLinks ? videoLinks.length : field.value}
                            disabled={hasVideoLinks}
                          />
                        </FormControl>
                        <FormDescription>
                          {hasVideoLinks
                            ? "Lesson count is set by the number of video links."
                            : "Enter the lesson count if there are no video links."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <div className="mt-2">
                  <FormLabel>Rating</FormLabel>
                  <Input value={typeof editCourse?.rating === 'number' ? editCourse.rating.toFixed(1) : '0.0'} disabled className="w-24" />
                  <FormDescription>This course's rating (updated by user reviews)</FormDescription>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditCourse(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateCourseMutation.isPending}
                >
                  {updateCourseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}