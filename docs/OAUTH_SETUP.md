# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for the Unlocked Coding application.

## Prerequisites

- A Google account for Google OAuth
- A GitHub account for GitHub OAuth
- Access to the application's environment configuration

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - For development: `http://localhost:5000/api/auth/google/callback`
     - For production: `https://yourdomain.com/api/auth/google/callback`
5. Copy the Client ID and Client Secret

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://holidays-redis2.qbthl0.easypanel.host/api/auth/google/callback
```

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Unlocked Coding
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and Client Secret

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

## Production Configuration

For production deployment, update the callback URLs:

```env
# Production OAuth URLs
GOOGLE_CALLBACK_URL=https://holidays-redis2.qbthl0.easypanel.host/api/auth/google/callback
GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
```

Also update the OAuth app settings in Google Cloud Console and GitHub Developer Settings with your production domain.

## Testing OAuth

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the authentication page: `http://localhost:3000/auth`

3. Click on the Google or GitHub buttons to test the OAuth flow

4. You should be redirected to the OAuth provider, then back to the application

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:
   - Ensure the callback URL in your OAuth app settings matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found" error**:
   - Verify your environment variables are correctly set
   - Restart the server after updating environment variables

3. **"Scope not allowed" error**:
   - For Google: Ensure the Google+ API is enabled
   - For GitHub: The default scopes should work, but you can customize them in the OAuth strategy

### Debug Mode

To enable debug logging for OAuth, add this to your environment:

```env
DEBUG=passport:*
```

## Security Considerations

1. **Never commit OAuth secrets to version control**
2. **Use environment variables for all sensitive configuration**
3. **Implement proper session management**
4. **Consider implementing CSRF protection**
5. **Use HTTPS in production**

## Additional Features

The OAuth implementation includes:

- **Account linking**: If a user signs up with email/password and later uses OAuth with the same email, the accounts are automatically linked
- **Profile data**: OAuth providers' profile information (name, avatar) is automatically imported
- **Unique usernames**: The system ensures unique usernames by appending numbers if needed
- **Session management**: Proper session handling with MongoDB store

## Support

If you encounter issues with OAuth setup, check:

1. The application logs for detailed error messages
2. The OAuth provider's documentation
3. Network connectivity and firewall settings
4. Environment variable configuration 