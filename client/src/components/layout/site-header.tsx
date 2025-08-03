import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Code, Menu, User, LogOut, Settings, Shield, Bell } from "lucide-react";
import { DropdownMenu as NotificationDropdownMenu, DropdownMenuContent as NotificationDropdownMenuContent, DropdownMenuItem as NotificationDropdownMenuItem, DropdownMenuLabel as NotificationDropdownMenuLabel, DropdownMenuSeparator as NotificationDropdownMenuSeparator, DropdownMenuTrigger as NotificationDropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";

export function SiteHeader() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);
  // Notification state
  const { notifications, loading: notificationsLoading, error: notificationsError } = useNotifications();
  const unreadCount = user ? notifications.filter((n) => !n.read.includes(user._id)).length : 0;

  // Ensure component is mounted (for SSR compatibility)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems = [
    { title: "Home", href: "/" },
    { title: "Categories", href: "/r" },
    { title: "About", href: "/about" },
  ];

  function isActive(path: string) {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <Code className="h-8 w-8 text-primary" />
                <span className="ml-2 text-lg font-bold">Unlocked Coding</span>
              </a>
            </Link>
            
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    {item.title}
                  </a>
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth & Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle />

            {user && (
              <NotificationDropdownMenu>
                <NotificationDropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative ml-2 h-8 w-8 rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </NotificationDropdownMenuTrigger>
                <NotificationDropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                  <NotificationDropdownMenuLabel>Notifications</NotificationDropdownMenuLabel>
                  <NotificationDropdownMenuSeparator />
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
                  ) : notificationsError ? (
                    <div className="p-4 text-center text-destructive">{notificationsError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No notifications</div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <NotificationDropdownMenuItem key={n._id || Math.random()} className={!n.read?.includes(user?._id) ? "bg-accent/30" : ""}>
                        <div>
                          <div className="font-semibold">{n.title}</div>
                          <div className="text-xs text-muted-foreground">{n.message}</div>
                        </div>
                      </NotificationDropdownMenuItem>
                    ))
                  )}
                  <NotificationDropdownMenuSeparator />
                  <NotificationDropdownMenuItem asChild>
                    <Link href="/notifications">
                      <a className="w-full text-center text-primary">View all</a>
                    </Link>
                  </NotificationDropdownMenuItem>
                </NotificationDropdownMenuContent>
              </NotificationDropdownMenu>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative ml-2 h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.profileImageUrl || ""} 
                        alt={user.username} 
                      />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <a className="flex w-full cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <a className="flex w-full cursor-pointer items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </a>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(user.role === 'teacher' && user.teacherApprovalStatus === 'approved') && (
                    <DropdownMenuItem asChild>
                      <Link href="/teacher-dashboard">
                        <a className="flex w-full cursor-pointer items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Teacher Dashboard
                        </a>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(!user.isAdmin && user.role !== 'teacher') && (
                    <DropdownMenuItem asChild>
                      <Link href="/teacher-application">
                        <a className="flex w-full cursor-pointer items-center">
                          <User className="mr-2 h-4 w-4" />
                          Become a Teacher
                        </a>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="ml-4 flex items-center">
                <Button asChild size="sm">
                  <Link href="/auth">Sign in</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Unlocked Coding</SheetTitle>
                  <SheetDescription>
                    Learn to code, unlock your future
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <a className={`text-sm ${
                        isActive(item.href)
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      }`}>
                        {item.title}
                      </a>
                    </Link>
                  ))}
                  {user ? (
                    <>
                      <Link href="/profile">
                        <a className="text-sm text-muted-foreground">Profile</a>
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin">
                          <a className="text-sm text-muted-foreground">Admin Panel</a>
                        </Link>
                      )}
                      {(user.role === 'teacher' && user.teacherApprovalStatus === 'approved') && (
                        <Link href="/teacher-dashboard">
                          <a className="text-sm text-muted-foreground">Teacher Dashboard</a>
                        </Link>
                      )}
                      {(!user.isAdmin && user.role !== 'teacher') && (
                        <Link href="/teacher-application">
                          <a className="text-sm text-muted-foreground">Become a Teacher</a>
                        </Link>
                      )}
                      <Button 
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                      >
                        {logoutMutation.isPending ? "Logging out..." : "Log out"}
                      </Button>
                    </>
                  ) : (
                    <Link href="/auth">
                      <a className="text-sm text-muted-foreground">Sign in</a>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
