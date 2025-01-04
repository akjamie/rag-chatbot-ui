
## API Integration

The application expects the following API endpoints:

### Chat Endpoints

- `GET /chat/histories/{user_id}` - Get chat history list
- `GET /chat/histories/{user_id}/{session_id}` - Get specific chat history
- `POST /chat/completion` - Send chat query
- `DELETE /chat/histories/{user_id}/{session_id}` - Delete chat history
- `PATCH /chat/histories/{user_id}/{session_id}/{request_id}/like` - Update message like status

### Headers

The application uses the following custom headers:
- `X-User-Id` - User identifier
- `X-Session-Id` - Chat session identifier
- `X-Request-Id` - Message request identifier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.