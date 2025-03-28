# User Module

This module handles user management functionality in the GG Server application.

## Features

- User Creation: Allows users to register with details like username, email, etc.
- User Profile Management: Allows users to view and update their profile information.
- User Information Retrieval: Retrieve details about a specific user by ID.
- User List: Get a list of all users in the system.

## API Endpoints

### User Management

- `POST /users`
  - Create a new user
  - Body: `CreateUserDto`

### Profile Management

- `GET /users/profile`

  - Get current user profile
  - Requires authentication
  - Returns: `UserResponse`

- `PUT /users/profile`
  - Update current user profile
  - Requires authentication
  - Body: `UpdateProfileDto`

### User Information Retrieval

- `GET /users/:id`
  - Get a user by ID
  - Requires authentication
  - Param: `id` (User ID)
  - Returns: `UserResponse`

### User List

- `GET /users`
  - Get all users
  - Requires authentication
  - Returns: `UserResponse[]`

### User Update

- `PUT /users/:id`
  - Update a user by ID
  - Requires authentication
  - Param: `id` (User ID)
  - Body: `UpdateUserDto`
  - Returns: `UserResponse`

## DTOs

### CreateUserDto

```typescript
{
  username: string; // 3-20 characters, alphanumeric + underscore
  email: string; // Valid email format
  password: string; // 6-20 characters, including letters and numbers
}
```
