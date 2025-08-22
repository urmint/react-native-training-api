# React Native Training API

A complete Node.js backend API for React Native trainees to learn API integration. This server includes email/password authentication and task management functionality with full Swagger documentation.

## Features

- **TypeScript** - Strongly typed codebase
- **Authentication** - JWT-based email/password authentication
- **Task Management** - Complete CRUD operations for tasks
- **API Documentation** - Comprehensive Swagger documentation
- **Security** - Helmet, CORS, and rate limiting
- **Error Handling** - Global error handling and validation

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The server will start on port 3000 (or the port specified in your .env file).

## API Documentation

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

This provides interactive documentation for all available endpoints.

## Available Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user profile (protected)

### Tasks

- `GET /api/tasks` - Get all tasks (protected)
- `GET /api/tasks/:id` - Get a specific task (protected)
- `POST /api/tasks` - Create a new task (protected)
- `PUT /api/tasks/:id` - Update a task (protected)
- `DELETE /api/tasks/:id` - Delete a task (protected)

## Environment Variables

The following environment variables are used in this project:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/react-native-training
JWT_SECRET=react-native-training-secret-key-for-jwt-authentication
JWT_EXPIRES_IN=1d
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Mongoose models
├── routes/         # Express routes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Express app
```

## Testing with Postman

1. Import the Postman collection (if available)
2. Register a new user
3. Login to get a JWT token
4. Use the token in the Authorization header for protected routes

## Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Authentication](https://jwt.io/)
- [React Native Fetch API](https://reactnative.dev/docs/network)

## License

This project is licensed under the ISC License.