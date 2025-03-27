# Message Module

This module handles message management functionality in the GG Server application, including message creation, retrieval, updates, deletion, history, and search.

## Features

- Message Management: Send, retrieve, update, and delete messages.
- Message History: Retrieve message history between a sender and receiver.
- Message Search: Search messages based on content and sender/receiver details.
- Message Updates: Update existing messages.

## API Endpoints

### Message Management

- `POST /messages`

  - Create a new message
  - Requires authentication
  - Body: `CreateMessageDto`
  - **Response**: `MessageResponseDto`

- `GET /messages`

  - Retrieve all messages
  - Requires authentication
  - **Response**: Array of `MessageResponseDto`

- `GET /messages/:id`

  - Get details of a specific message
  - Requires authentication
  - Path parameter: `id` (UUID)
  - **Response**: `MessageResponseDto`

- `PATCH /messages/:id`

  - Update an existing message
  - Requires authentication
  - Path parameter: `id` (UUID)
  - Body: `UpdateMessageDto`
  - **Response**: `MessageResponseDto`

- `DELETE /messages/:id`
  - Delete a specific message
  - Requires authentication
  - Path parameter: `id` (UUID)
  - **Response**: No content

### Message History

- `GET /messages/history`
  - Retrieve message history between two users
  - Requires authentication
  - Query parameters:
    - `senderId`: The ID of the sender
    - `receiverId`: The ID of the receiver
    - `page`: Page number (default: 1)
    - `limit`: Number of results per page (default: 10)
    - `type`: Type of messages (optional)
    - `startDate`: Start date for filtering messages (optional)
    - `endDate`: End date for filtering messages (optional)
  - **Response**: Array of `MessageResponseDto`

### Message Search

- `GET /messages/search`
  - Search messages based on content and sender/receiver details
  - Requires authentication
  - Query parameters:
    - `query`: Search query (e.g., message content)
    - `senderId`: The ID of the sender
    - `receiverId`: The ID of the receiver
  - **Response**: Array of `MessageResponseDto`

## DTOs

### CreateMessageDto

```typescript
{
  content: string; // The content of the message (required)
  recipientId: string; // The recipient's user ID (required)
}
```
