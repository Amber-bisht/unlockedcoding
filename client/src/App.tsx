import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { WebsiteJsonLd, OrganizationJsonLd } from "@/components/json-ld";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AuthSuccessPage from "@/pages/auth-success";
import ProfileCompletion from "@/pages/profile-completion";
import ProfilePage from "@/pages/profile-page";
import ProfileEditPage from "@/pages/profile-edit";
import CategoriesPage from "@/pages/categories-page";
import CategoryDetail from "@/pages/category-detail";
import CourseDetail from "@/pages/course-detail";

import AboutPage from "@/pages/about-page";
import AboutProjectPage from "@/pages/about-project";
import CareerPage from "@/pages/career";
import AdsPage from "@/pages/ads";
import BlogPage from "@/pages/blog-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPage from "@/pages/privacy-page";
import CopyrightPage from "@/pages/copyright-page";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import ManageCategories from "@/pages/admin/manage-categories";
import ManageCourses from "@/pages/admin/manage-courses";
import AddCategory from "@/pages/admin/add-category";
import AddCourse from "@/pages/admin/add-course";
import SendNotification from "@/pages/admin/send-notification";
import CourseVideosPage from "@/pages/course-videos";
import { ProtectedRoute } from "./lib/protected-route";
import { AdminProtectedRoute } from "./lib/admin-protected-route";
import { TeacherProtectedRoute } from "./lib/teacher-protected-route";
import ManagePopularCourses from "@/pages/admin/manage-popular-courses";
import AdminCommentsPage from "@/pages/admin/comments";
import AdminUsersPage from "@/pages/admin/users";
import ContactSubmissionsPage from "@/pages/admin/contact";
import ManageAdsPage from "@/pages/admin/manage-ads";
import ManageTrackingLinksPage from "@/pages/admin/manage-tracking-links";
import TrackingLinkStatsPage from "@/pages/admin/tracking-link-stats";
import ManageTeachersPage from "@/pages/admin/manage-teachers";
import TeacherApplicationPage from "@/pages/teacher-application";
import TeacherDashboardPage from "@/pages/admin/teacher-dashboard";
import TeacherAddCoursePage from "@/pages/teacher/add-course";
import TeacherEditCoursePage from "@/pages/teacher/edit-course";
import TestTeacherPage from "@/pages/test-teacher";
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/success" component={AuthSuccessPage} />
      <ProtectedRoute path="/profile/complete" component={ProfileCompletion} />
      <ProtectedRoute path="/profile/edit" component={ProfileEditPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/r" component={CategoriesPage} />
      <Route path="/r/:categorySlug" component={CategoryDetail} />
      <Route path="/course/:courseId" component={CourseDetail} />

      <Route path="/about" component={AboutPage} />
      <Route path="/about-project" component={AboutProjectPage} />
      <Route path="/career" component={CareerPage} />
      <Route path="/ads" component={AdsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/copyright" component={CopyrightPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <AdminProtectedRoute path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard">
        <Redirect to="/admin" />
      </Route>
      <AdminProtectedRoute path="/admin/categories" component={ManageCategories} />
      <AdminProtectedRoute path="/admin/courses" component={ManageCourses} />
      <AdminProtectedRoute path="/admin/add-category" component={AddCategory} />
      <AdminProtectedRoute path="/admin/add-course" component={AddCourse} />
      <AdminProtectedRoute path="/admin/send-notification" component={SendNotification} />
      <AdminProtectedRoute path="/admin/manage-popular-courses" component={ManagePopularCourses} />
      <AdminProtectedRoute path="/admin/comments" component={AdminCommentsPage} />
      <AdminProtectedRoute path="/admin/users" component={AdminUsersPage} />
      <AdminProtectedRoute path="/admin/contact" component={ContactSubmissionsPage} />
      <AdminProtectedRoute path="/admin/ads" component={ManageAdsPage} />
      <AdminProtectedRoute path="/admin/tracking-links" component={ManageTrackingLinksPage} />
      <AdminProtectedRoute path="/admin/tracking-links/:id/stats" component={TrackingLinkStatsPage} />
      <AdminProtectedRoute path="/admin/manage-teachers" component={ManageTeachersPage} />
      <Route path="/teacher-application" component={TeacherApplicationPage} />
      <Route path="/test-teacher" component={TestTeacherPage} />
      <TeacherProtectedRoute path="/teacher-dashboard" component={TeacherDashboardPage} />
      <TeacherProtectedRoute path="/teacher/add-course" component={TeacherAddCoursePage} />
      <TeacherProtectedRoute path="/teacher/edit-course/:id" component={TeacherEditCoursePage} />
      <Route path="/course-videos" component={CourseVideosPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Get dehydrated state from SSR
  const dehydratedState = (window as any).__DEHYDRATED_STATE__;

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <ThemeProvider defaultTheme="light" storageKey="unlocked-theme">
          <AuthProvider>
            <Router />
            <Toaster />
            {/* JSON-LD structured data for improved SEO */}
            <WebsiteJsonLd />
            <OrganizationJsonLd />
          </AuthProvider>
        </ThemeProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

export default App;
