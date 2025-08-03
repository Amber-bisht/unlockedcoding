# Admin Setup Guide

## Overview

The admin system has been updated to use OAuth authentication (Google and GitHub) instead of hardcoded credentials. This provides better security and easier management.

## How to Set Up Admin Access

### 1. User Registration
First, have the user register/login through the normal OAuth flow (Google or GitHub) at `/auth`.

### 2. Grant Admin Privileges
Once the user has an account, you can grant them admin privileges using the provided script:

```bash
# Grant admin privileges to a user by email
npm run set-admin user@example.com

# Grant admin privileges to a user by username
npm run set-admin username

# Remove admin privileges
npm run set-admin user@example.com remove
npm run set-admin username remove
```

### 3. Access Admin Panel
The user can now access the admin panel at `/admin/login` using their OAuth credentials (Google or GitHub).

## Security Notes

- Only users with `isAdmin: true` in the database can access admin routes
- Admin privileges are checked on both frontend and backend
- All admin actions are logged for security monitoring
- OAuth provides secure authentication without storing passwords

## Admin Routes

The following routes require admin privileges:
- `/admin/*` - All admin panel routes
- `/api/admin/*` - All admin API endpoints

## Troubleshooting

If a user cannot access the admin panel:
1. Verify they have `isAdmin: true` in the database
2. Check that they are properly authenticated via OAuth
3. Ensure the admin middleware is working correctly

## Database Management

To check admin users in the database:
```javascript
// In MongoDB shell or Mongoose
db.users.find({ isAdmin: true })
```

To manually set admin privileges:
```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isAdmin: true } }
)
``` 