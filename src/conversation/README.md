# Conversation Module

This module handles conversation management functionality in the GG Server application.

## Features

- Conversation Creation: Create new conversations (group or direct)
- Conversation Updates: Update conversation details (title, type)
- Conversation Deletion: Delete existing conversations
- Conversation Retrieval: Fetch all conversations or retrieve a conversation by ID

## API Endpoints

### Conversation Management

- `POST /conversations`

  - Create a new conversation
  - Requires authentication
  - Body: `CreateConversationDto`

- `GET /conversations`

  - Get all conversations
  - Requires authentication

- `GET /conversations/:id`

  - Get a conversation by ID
  - Requires authentication

- `PUT /conversations/:id`

  - Update a conversation by ID
  - Requires authentication
  - Body: `UpdateConversationDto`

- `DELETE /conversations/:id`
  - Delete a conversation by ID
  - Requires authentication

## DTOs

### CreateConversationDto

```typescript
{
  type: 'group' | 'direct';  // Conversation type (either group or direct)
  title?: string;            // Title for group conversations (optional for direct conversations)
}
```
