import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { FC } from "react";

export function TeacherProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: FC;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if user is an approved teacher
  const isApprovedTeacher = user.role === 'teacher' && user.teacherApprovalStatus === 'approved';
  
  if (!isApprovedTeacher) {
    return (
      <Route path={path}>
        <Redirect to="/teacher-application" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
} 