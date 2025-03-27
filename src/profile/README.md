# Profile Module

This module handles user profile management functionality in the GG Server application.

## Features

- Profile Updates: Modify user profile details (username, email, display name, bio)
- Avatar Management: Upload and manage user profile pictures
- Settings Management: Handle user preferences (email notifications, dark mode, language)

## API Endpoints

### Profile Management

- `PATCH /profile`
  - Update user profile details
  - Requires authentication
  - Body: `UpdateProfileDto`

### Avatar Management

- `POST /profile/avatar`
  - Upload user avatar
  - Requires authentication
  - Content-Type: `multipart/form-data`
  - Field: `avatar` (image file)

### Settings Management

- `GET /settings`
  - Get user settings
  - Requires authentication

- `PATCH /settings`
  - Update user settings
  - Requires authentication
  - Body: `UpdateSettingsDto`

## DTOs

### UpdateProfileDto
```typescript
{
  username?: string;      // 3-20 characters, alphanumeric + underscore
  email?: string;        // Valid email format
  displayName?: string;  // 3-50 characters
  bio?: string;         // Max 500 characters
}
```

### UpdateSettingsDto
```typescript
{
  emailNotifications?: boolean;  // Enable/disable email notifications
  darkMode?: boolean;           // Enable/disable dark mode
  language?: string;           // 'en' | 'fr' | 'es'
}
```

## File Storage

Avatars are stored in the `./uploads/avatars` directory in development. For production, it's recommended to use a cloud storage service like AWS S3.

## Configuration

The module uses the following environment variables:
- `UPLOAD_DIR`: Directory for storing avatar files (default: './uploads/avatars')

## Security

- All endpoints are protected with JWT authentication
- File uploads are validated for:
  - File type (images only: jpg, jpeg, png, gif)
  - File size (max 5MB)
  - File name sanitization
- Input validation using class-validator
