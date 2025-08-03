# Contribution Calendar Feature

## Overview

The Contribution Calendar is a GitHub-style activity tracking feature that displays user login activity over the past 365 days. It provides a visual representation of user engagement and helps track user activity patterns.

## Features

### 🎯 Core Functionality
- **Visual Calendar Grid**: 365-day calendar showing login activity
- **Color-coded Intensity**: Green squares with varying intensity based on login count
- **Interactive Tooltips**: Hover over squares to see detailed information
- **Activity Statistics**: Total logins, active days, and activity rate
- **Responsive Design**: Works on desktop and mobile devices

### 📊 Activity Tracking
- **Daily Login Count**: Tracks multiple logins per day
- **Session Information**: Records IP address, user agent, and session ID
- **Automatic Tracking**: Logs activity on every successful login (local and OAuth)
- **Data Retention**: Stores activity for the past 365 days

### 🔐 Security & Privacy
- **User-specific Data**: Each user only sees their own activity
- **Admin Access**: Admins can view any user's activity
- **Session-based**: Tracks actual login sessions, not just page visits
- **Rate Limiting**: Integrates with existing rate limiting system

## Technical Implementation

### Backend Components

#### Database Model (`LoginActivity`)
```typescript
interface ILoginActivity {
  userId: mongoose.Types.ObjectId;
  loginDate: Date;
  loginCount: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}
```

#### API Endpoints
- `GET /api/login-activity/user` - Get current user's activity
- `GET /api/login-activity/user/:userId` - Get specific user's activity (admin only)

#### Controllers
- `login-activity.controller.ts` - Handles activity tracking and retrieval
- Integrated with `auth.controller.ts` and `oauth.controller.ts` for automatic tracking

### Frontend Components

#### React Component (`ContributionCalendar`)
- **Props**: `userId` (optional), `className` (optional)
- **Features**: 
  - Automatic data fetching
  - Loading and error states
  - Responsive grid layout
  - Interactive tooltips
  - Color intensity mapping

#### Integration Points
- **Profile Page**: Added as "Activity" tab
- **Admin Dashboard**: Added as "User Activity" tab
- **Reusable**: Can be used anywhere in the app

## Usage

### For Users
1. Navigate to your profile page (`/profile`)
2. Click on the "Activity" tab
3. View your login activity calendar
4. Hover over squares to see detailed information

### For Admins
1. Navigate to admin dashboard (`/admin`)
2. Click on "User Activity" tab
3. View overall activity statistics
4. Access individual user activity through user management

### For Developers

#### Adding to a New Page
```tsx
import { ContributionCalendar } from '@/components/ContributionCalendar';

function MyPage() {
  return (
    <div>
      <h1>User Activity</h1>
      <ContributionCalendar />
    </div>
  );
}
```

#### Viewing Specific User Activity (Admin Only)
```tsx
import { ContributionCalendar } from '@/components/ContributionCalendar';

function AdminUserView({ userId }) {
  return (
    <div>
      <h1>User Activity</h1>
      <ContributionCalendar userId={userId} />
    </div>
  );
}
```

## Data Structure

### Activity Data Format
```typescript
interface ActivityData {
  date: string;           // YYYY-MM-DD format
  loginCount: number;     // Number of logins on this date
  hasActivity: boolean;   // Whether any activity occurred
}

interface ContributionCalendarData {
  activities: ActivityData[];
  totalLogins: number;
  activeDays: number;
  dateRange: {
    start: string;
    end: string;
  };
}
```

### Color Intensity Mapping
- **Gray**: No activity (0 logins)
- **Light Green**: 1 login
- **Medium Green**: 2 logins
- **Dark Green**: 3 logins
- **Very Dark Green**: 4+ logins

## Testing

### Generate Sample Data
```bash
# Note: The test-login-activity script has been removed from the project
# Activity tracking is now fully automated and integrated into the login system
```

The activity tracking system is now fully automated and integrated into the login system.

### Manual Testing
1. Start the development server: `npm run dev`
2. Create a user account or log in
3. Navigate to `/profile` and check the Activity tab
4. Log in multiple times to see activity tracking
5. Test with different browsers/devices to see session tracking

## Configuration

### Environment Variables
No additional environment variables required. Uses existing MongoDB connection.

### Database Indexes
The `LoginActivity` model includes optimized indexes:
- Compound index on `userId` and `loginDate` (unique)
- Index on `loginDate` for date range queries
- Index on `sessionId` for session tracking

### Rate Limiting
Activity tracking integrates with the existing rate limiting system:
- Failed login attempts are not tracked
- Only successful logins create activity records
- Rate limiting prevents abuse of login endpoints

## Future Enhancements

### Planned Features
- **Export Data**: Allow users to export their activity data
- **Activity Goals**: Set and track login frequency goals
- **Streak Tracking**: Show current and longest login streaks
- **Activity Sharing**: Share activity calendars with other users
- **Advanced Analytics**: More detailed activity insights

### Potential Improvements
- **Real-time Updates**: WebSocket integration for live activity updates
- **Activity Notifications**: Remind users about their activity patterns
- **Gamification**: Achievements and badges for consistent activity
- **API Rate Limiting**: Prevent abuse of activity endpoints

## Troubleshooting

### Common Issues

#### No Activity Data Showing
1. Check if user has logged in successfully
2. Verify database connection
3. Check server logs for errors
4. Ensure user exists in database

#### Activity Not Tracking
1. Verify login endpoints are calling `trackLoginActivity`
2. Check database indexes are created
3. Ensure MongoDB connection is working
4. Check server logs for tracking errors

#### Calendar Not Rendering
1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Check network requests in browser dev tools
4. Ensure React Query is properly configured

### Debug Commands
```bash
# Check database connection
npm run dev

# Check server logs
docker-compose logs -f server
```

## Security Considerations

### Data Privacy
- Activity data is user-specific and private
- Admins can only view activity with proper authentication
- No activity data is exposed in public APIs

### Rate Limiting
- Activity tracking respects existing rate limits
- Failed login attempts don't create activity records
- Session-based tracking prevents abuse

### Data Retention
- Activity data is stored for 365 days
- Old data can be automatically cleaned up
- Users can request data deletion

## Performance

### Database Optimization
- Indexed queries for fast data retrieval
- Compound indexes for efficient filtering
- Minimal data storage per activity record

### Frontend Optimization
- React Query for efficient data fetching
- Memoized components to prevent unnecessary re-renders
- Responsive design for mobile performance

### Caching Strategy
- Activity data is cached by React Query
- Stale data is refetched automatically
- Optimistic updates for better UX 