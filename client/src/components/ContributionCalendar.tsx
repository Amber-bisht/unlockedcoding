import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '../lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar, TrendingUp, Activity } from 'lucide-react';

interface ActivityData {
  date: string;
  loginCount: number;
  hasActivity: boolean;
}

interface ContributionCalendarData {
  activities: ActivityData[];
  totalLogins: number;
  activeDays: number;
  dateRange: {
    start: string;
    end: string;
  };
  currentMonth?: {
    year: number;
    month: number;
    monthName: string;
  };
}

interface ContributionCalendarProps {
  userId?: string;
  className?: string;
}

// Mock data for demonstration - current month
const generateMockData = (): ContributionCalendarData => {
  const activities: ActivityData[] = [];
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    
    // Generate realistic activity pattern for current month
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let loginCount = 0;
    // More activity on weekdays
    if (!isWeekend) {
      loginCount = Math.random() < 0.8 ? 1 : 0;
    } else {
      // Less activity on weekends
      loginCount = Math.random() < 0.6 ? 1 : 0;
    }
    
    activities.push({
      date: dateKey,
      loginCount,
      hasActivity: loginCount > 0
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalLogins = activities.reduce((sum, activity) => sum + activity.loginCount, 0);
  const activeDays = activities.filter(activity => activity.hasActivity).length;

  return {
    activities,
    totalLogins,
    activeDays,
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    },
    currentMonth: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      monthName: now.toLocaleDateString('en-US', { month: 'long' })
    }
  };
};

export function ContributionCalendar({ userId, className }: ContributionCalendarProps) {
  const { data, isLoading, error } = useQuery<ContributionCalendarData>({
    queryKey: ['/api/login-activity/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !userId, // Only fetch current user's data if no userId provided
  });

  const { data: userData, isLoading: isLoadingUser } = useQuery<ContributionCalendarData>({
    queryKey: [`/api/login-activity/user/${userId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!userId, // Only fetch specific user's data if userId provided
  });

  // Use mock data if no real data is available
  const finalData = (userId ? userData : data) || generateMockData();
  const finalIsLoading = userId ? isLoadingUser : isLoading;

  if (finalIsLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Login Activity
          </CardTitle>
          <CardDescription>Your login activity over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Login Activity
          </CardTitle>
          <CardDescription>Your login activity over the past year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load login activity
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate monthly calendar grid for current month
  const generateCalendarGrid = () => {
    const grid: ActivityData[][] = [];
    const daysPerWeek = 7;
    
    // Get current month info
    const now = new Date();
    const currentMonth = finalData.currentMonth || {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      monthName: now.toLocaleDateString('en-US', { month: 'long' })
    };
    
    // Get first day of current month
    const monthStart = new Date(currentMonth.year, currentMonth.month - 1, 1);
    const monthEnd = new Date(currentMonth.year, currentMonth.month, 0);
    const daysInMonth = monthEnd.getDate();
    
    // Calculate weeks needed
    const firstDayOfWeek = monthStart.getDay(); // 0 = Sunday
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(monthStart.getDate() - mondayOffset);
    
    const totalDays = mondayOffset + daysInMonth;
    const weeks = Math.ceil(totalDays / 7);
    
    for (let week = 0; week < weeks; week++) {
      const currentWeek: ActivityData[] = [];
      for (let day = 0; day < daysPerWeek; day++) {
        const currentDate = new Date(calendarStart);
        currentDate.setDate(calendarStart.getDate() + (week * 7) + day);
        const dateKey = currentDate.toISOString().split('T')[0];
        
        // Check if this date is within current month
        const isInCurrentMonth = currentDate.getMonth() === (currentMonth.month - 1) && 
                                currentDate.getDate() >= 1 && 
                                currentDate.getDate() <= daysInMonth;
        
        if (isInCurrentMonth) {
          // Find activity for this date
          const activity = finalData.activities.find(a => a.date === dateKey);
          if (activity) {
            currentWeek.push(activity);
          } else {
            // Add empty day for current month
            currentWeek.push({
              date: dateKey,
              loginCount: 0,
              hasActivity: false
            });
          }
        } else {
          // Add empty day outside current month
          currentWeek.push({
            date: dateKey,
            loginCount: 0,
            hasActivity: false
          });
        }
      }
      grid.push(currentWeek);
    }
    
    return grid;
  };

  const grid = generateCalendarGrid();

  // Get day labels for the header
  const getDayLabels = () => {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  };

  const dayLabels = getDayLabels();

  // Get color intensity based on login count
  const getColorIntensity = (loginCount: number) => {
    if (loginCount === 0) return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    return 'bg-green-500 dark:bg-green-500 border-green-500 dark:border-green-500';
  };

  // Get tooltip text
  const getTooltipText = (activity: ActivityData) => {
    const date = new Date(activity.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (activity.loginCount === 0) {
      return `${formattedDate}: No activity`;
    } else {
      return `${formattedDate}: Active`;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          User Activity ({finalData.activeDays} Active Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-3">


          {/* Monthly Calendar Grid */}
          <div className="w-full max-w-xs mx-auto">
            <div className="flex flex-col">
              {/* Month title */}
              <div className="text-center mb-1">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {finalData.currentMonth?.monthName} {finalData.currentMonth?.year}
                </h3>
              </div>
              
              {/* Day labels header */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayLabels.map((day) => (
                  <div key={day} className="text-xs text-muted-foreground text-center font-medium py-0.5">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar weeks */}
              <div className="grid grid-cols-7 gap-0.5">
                {grid.map((week, weekIndex) => (
                  <React.Fragment key={weekIndex}>
                    {week.map((activity, dayIndex) => {
                      const date = new Date(activity.date);
                      const dayNumber = date.getDate();
                      const currentMonth = finalData.currentMonth || { month: new Date().getMonth() + 1 };
                      const isInCurrentMonth = date.getMonth() === (currentMonth.month - 1);
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`
                            relative aspect-square rounded-sm border
                            ${getColorIntensity(activity.loginCount)}
                            hover:scale-110 transition-transform cursor-pointer
                            flex items-center justify-center
                            ${!isInCurrentMonth ? 'opacity-20' : activity.loginCount === 0 ? 'opacity-60' : ''}
                          `}
                          title={getTooltipText(activity)}
                        >
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {isInCurrentMonth ? dayNumber : ''}
                          </span>
                          {activity.loginCount > 0 && (
                            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="text-muted-foreground">No Activity</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 dark:bg-green-500 rounded-sm"></div>
            </div>
            <span className="text-muted-foreground">Activity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 