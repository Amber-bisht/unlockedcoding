import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isYouTubeVideo, isYouTubePlaylist, parseYouTubeVideo, parseYouTubePlaylist, parseBulkYouTubeLinks, validateYouTubeLink } from "@/lib/youtube-utils";
import { YouTubeUrlParser } from "@/components/YouTubeUrlParser";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ArrowLeft, Loader2, Youtube } from "lucide-react";

// Define form validation schema
const formSchema = z.object({
  title: z.string().min(5, "Course title must be at least 5 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens and no spaces"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  longDescription: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  originalPrice: z.coerce.number().min(0, "Original price cannot be negative").optional(),
  duration: z.coerce.number().min(1, "Duration must be at least 1 hour"),
  level: z.string().min(1, "Please select a level"),
  categoryId: z.string().min(1, "Please select a category"),
  enrollmentLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instructorName: z.string().optional(),
  lessonCount: z.coerce.number().min(0, "Lesson count cannot be negative").optional(),
  learningObjectives: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  videoLinks: z.array(z.object({
    title: z.string().min(1, "Video title is required"),
    url: z.string().url("Must be a valid URL")
  })).optional(),
  videoLinksBulk: z.string().optional(),
});

const levels = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export default function TeacherEditCoursePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();
  const courseId = window.location.pathname.split('/').pop();

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch course data
  const { data: course, isLoading: isCourseLoading } = useQuery<any>({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }
      return response.json();
    },
    enabled: !!courseId,
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      longDescription: "",
      imageUrl: "",
      price: 0,
      originalPrice: 0,
      duration: 1,
      level: "",
      categoryId: "",
      enrollmentLink: "",
      instructorName: "",
      lessonCount: 0,
      learningObjectives: [],
      requirements: [],
      targetAudience: [],
      videoLinks: [],
      videoLinksBulk: "",
    },
  });

  // Update form when course data is loaded
  React.useEffect(() => {
    if (course) {
      // Convert existing video links to bulk format
      const bulkVideoLinks = course.videoLinks?.map((link: any) => `${link.title}:${link.url}`).join('\n') || '';
      
      form.reset({
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        longDescription: course.longDescription || "",
        imageUrl: course.imageUrl || "",
        price: course.price || 0,
        originalPrice: course.originalPrice || 0,
        duration: course.duration || 1,
        level: course.level || "",
        categoryId: course.categoryId || "",
        enrollmentLink: course.enrollmentLink || "",
        instructorName: course.instructorName || "",
        lessonCount: course.lessonCount || 0,
        learningObjectives: course.learningObjectives || [],
        requirements: course.requirements || [],
        targetAudience: course.targetAudience || [],
        videoLinks: course.videoLinks || [],
        videoLinksBulk: bulkVideoLinks,
      });
    }
  }, [course, form]);

  // Set up mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("PUT", `/api/courses/${courseId}`, values);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update course");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
      });
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/courses"] });
      // Redirect to teacher dashboard
      navigate("/teacher-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Process video links from bulk input
    if (values.videoLinksBulk) {
      const processedLinks = parseBulkYouTubeLinks(values.videoLinksBulk);
      values.videoLinks = processedLinks;
    }
    
    mutate(values);
  };

  if (isCourseLoading) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <Button onClick={() => navigate("/teacher-dashboard")}>
              Back to Teacher Dashboard
            </Button>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/teacher-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teacher Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground">
            Update your course information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Update the details for your course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="course-slug" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL-friendly version of the title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the course"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Long Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the course"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isCategoriesLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            ) : (
                              categories?.map((category) => (
                                <SelectItem key={category._id} value={category._id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {levels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enrollmentLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrollment Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/enroll" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link where students can enroll in your course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="instructorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specify who uploaded this course. Shows on the course page as "Uploaded by: [Name]"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Video Links</h3>
                      <p className="text-sm text-muted-foreground">
                        Add video links in bulk format: title:url (one per line)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const sampleLinks = `Day 1 - Introduction:https://example.com/video1
Day 2 - Basics:https://example.com/video2
Day 3 - Advanced:https://example.com/video3`;
                          form.setValue("videoLinksBulk", sampleLinks);
                        }}
                      >
                        Add Sample Videos
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const youtubeUrl = prompt("Enter YouTube URL (video or playlist):");
                          if (youtubeUrl) {
                            if (isYouTubeVideo(youtubeUrl)) {
                              const video = parseYouTubeVideo(youtubeUrl);
                              if (video) {
                                const currentLinks = form.getValues("videoLinksBulk") || "";
                                const newLink = `${video.title}:${video.url}`;
                                form.setValue("videoLinksBulk", currentLinks + (currentLinks ? "\n" : "") + newLink);
                                toast({
                                  title: "YouTube Video Added",
                                  description: video.title,
                                });
                              }
                            } else if (isYouTubePlaylist(youtubeUrl)) {
                              const playlist = parseYouTubePlaylist(youtubeUrl);
                              if (playlist) {
                                const currentLinks = form.getValues("videoLinksBulk") || "";
                                const newLinks = playlist.videos.map(v => `${v.title}:${v.url}`).join('\n');
                                form.setValue("videoLinksBulk", currentLinks + (currentLinks ? "\n" : "") + newLinks);
                                toast({
                                  title: "YouTube Playlist Added",
                                  description: `${playlist.videos.length} videos added`,
                                });
                              }
                            } else {
                              toast({
                                title: "Invalid YouTube URL",
                                description: "Please enter a valid YouTube video or playlist URL",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        Add YouTube
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="videoLinksBulk"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Video Title:https://example.com/video1&#10;Another Video:https://example.com/video2"
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Format: title:url (one per line)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating Course...
                      </>
                    ) : (
                      "Update Course"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/teacher-dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </>
  );
} 