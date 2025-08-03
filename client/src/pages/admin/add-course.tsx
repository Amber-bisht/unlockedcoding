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

export default function AddCoursePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/categories"],
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

  // Set up mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/courses", values);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create course");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course created",
        description: "The course has been created successfully.",
      });
      // Invalidate courses query
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/stats"] });
      // Redirect to admin dashboard
      navigate("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Submitting course data:', values);
    
    // Auto-generate slug if not provided
    if (!values.slug && values.title) {
      values.slug = generateSlug(values.title);
    }
    
    // Parse videoLinksBulk if it exists and videoLinks is empty
    if (values.videoLinksBulk && (!values.videoLinks || values.videoLinks.length === 0)) {
      const parsedLinks = parseBulkYouTubeLinks(values.videoLinksBulk);
      const validLinks = parsedLinks.filter(link => validateYouTubeLink(link));
      
      if (validLinks.length > 0) {
        values.videoLinks = validLinks;
        console.log('Parsed video links:', validLinks);
      }
    }
    
    // Remove videoLinksBulk from the submission data
    const { videoLinksBulk, ...submissionData } = values;
    
    console.log('Final submission data:', submissionData);
    mutate(submissionData);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4 pl-0 flex items-center text-muted-foreground"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Add New Course</h1>
            <p className="text-muted-foreground mt-1">Create a new course for your platform</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Enter the details for the new course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Introduction to JavaScript" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be displayed to users.
                        </FormDescription>
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
                          <Input 
                            placeholder="e.g. introduction-to-javascript" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-generate slug if empty
                              if (!e.target.value && form.getValues("title")) {
                                const slug = generateSlug(form.getValues("title"));
                                field.onChange(slug);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          URL-friendly identifier. Auto-generated from title if left empty.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this course covers..."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A detailed description of the course content and learning outcomes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a more detailed description of the course..."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Extended description for course details page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($) *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min="0" step="0.01" />
                          </FormControl>
                          <FormDescription>
                            Set to 0 for a free course.
                          </FormDescription>
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
                            <Input type="number" {...field} min="0" step="0.01" />
                          </FormControl>
                          <FormDescription>
                            Original price before discount (optional).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (hours) *</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min="1" step="1" />
                          </FormControl>
                          <FormDescription>
                            Estimated time to complete the course.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a level" />
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
                          <FormDescription>
                            The difficulty level of the course.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isCategoriesLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories && categories.map((category: any) => (
                                <SelectItem key={category._id} value={category._id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The category this course belongs to.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a URL for the course thumbnail image.
                        </FormDescription>
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
                          Provide a URL where students can enroll in this course (e.g., Udemy, Coursera, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instructorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor/Admin Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                                    description: `Added: ${video.title}`,
                                  });
                                }
                              } else if (isYouTubePlaylist(youtubeUrl)) {
                                const playlist = parseYouTubePlaylist(youtubeUrl);
                                if (playlist) {
                                  // For now, just add the playlist URL
                                  const currentLinks = form.getValues("videoLinksBulk") || "";
                                  const newLink = `${playlist.title}:${youtubeUrl}`;
                                  form.setValue("videoLinksBulk", currentLinks + (currentLinks ? "\n" : "") + newLink);
                                  toast({
                                    title: "YouTube Playlist Added",
                                    description: `Added: ${playlist.title}`,
                                  });
                                }
                              } else {
                                toast({
                                  title: "Invalid URL",
                                  description: "Please enter a valid YouTube video or playlist URL",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                        >
                          <Youtube className="h-4 w-4 mr-1" />
                          Add YouTube
                        </Button>
                      </div>
                    </div>
                    
                    {/* YouTube URL Parser */}
                    <div className="border-t pt-4">
                      <YouTubeUrlParser
                        onVideosParsed={(videos) => {
                          const currentLinks = form.getValues("videoLinksBulk") || "";
                          const newLinks = videos.map(v => `${v.title}:${v.url}`).join('\n');
                          form.setValue("videoLinksBulk", currentLinks + (currentLinks ? "\n" : "") + newLinks);
                        }}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
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
                                form.setValue("videoLinks", validLinks);
                                
                                console.log('Parsed links:', parsedLinks);
                                console.log('Valid links:', validLinks);
                                console.log('Invalid links:', invalidLinks);
                                
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
                    
                    {/* Debug button to test parsing */}
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const bulkText = form.getValues("videoLinksBulk");
                          const videoLinks = form.getValues("videoLinks");
                          console.log('Current bulk text:', bulkText);
                          console.log('Current video links:', videoLinks);
                        }}
                      >
                        Debug: Check Current Values
                      </Button>
                    </div>
                    
                    {(form.watch("videoLinks")?.length || 0) > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Parsed Videos ({(form.watch("videoLinks")?.length || 0)})</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                          {form.watch("videoLinks")?.map((video, index) => video && (
                            <div key={index} className="text-xs text-muted-foreground">
                              <span className="font-medium">{video.title || ''}</span>
                              <span className="ml-2">→</span>
                              <span className="ml-2 truncate">{video.url || ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {form.watch("videoLinks") && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Lesson Count: <b>{form.watch("videoLinks")?.length || 0}</b></span>
                      </div>
                    )}
                    {/* Show static rating field for admin reference */}
                    <div className="mt-2">
                      <FormLabel>Rating</FormLabel>
                      <Input value={0.0} disabled className="w-24" />
                      <FormDescription>This course's rating (default 0.0, updated by user reviews)</FormDescription>
                    </div>
                  </div>
                  
                  {/* Learning Objectives */}
                  <FormField
                    control={form.control}
                    name="learningObjectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Objectives</FormLabel>
                        <FormControl>
                          <Textarea 
                            value={(field.value || []).join('\n')}
                            onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                            placeholder="Enter learning objectives (one per line)
Example: Understand JavaScript fundamentals
Example: Learn DOM manipulation
Example: Master async programming"
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
                  
                  {/* Requirements */}
                  <FormField
                    control={form.control}
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
                  
                  {/* Target Audience */}
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Textarea 
                            value={(field.value || []).join('\n')}
                            onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim() !== ''))}
                            placeholder="Who this course is for (one per line)
Example: Beginners in programming
Example: Web developers
Example: Students learning JavaScript"
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter one target audience per line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Lesson Count field: enabled if no videoLinks, disabled if videoLinks exist */}
                  <FormField
                    control={form.control}
                    name="lessonCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            value={(form.watch("videoLinks")?.length || 0) > 0 ? (form.watch("videoLinks")?.length || 0) : field.value}
                            disabled={(form.watch("videoLinks")?.length || 0) > 0}
                          />
                        </FormControl>
                        <FormDescription>
                          {(form.watch("videoLinks")?.length || 0) > 0
                            ? "Lesson count is set by the number of video links."
                            : "Enter the lesson count if there are no video links."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => navigate("/admin")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Course
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}