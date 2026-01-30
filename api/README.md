# Travel with Student - Backend API

Backend Express.js API for the Travel with Student platform.

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update with your database credentials.

3. Set up Prisma:
```bash
# Copy schema from frontend project
cp ../travel-app/prisma/schema.prisma ./prisma/schema.prisma

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Guides
- `GET /api/guides` - Get all guides (with filters)
- `GET /api/guides/:id` - Get single guide
- `GET /api/guides/city/:city` - Get guides by city
- `PUT /api/guides/:id` - Update guide profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/guide/:guideId` - Get guide reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Messages
- `POST /api/messages/conversation` - Get/create conversation
- `GET /api/messages/conversations/:userId` - Get user conversations
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get conversation messages
- `PUT /api/messages/read/:conversationId` - Mark messages as read

## Database Management

Open Prisma Studio to manage database:
```bash
npm run prisma:studio
```

## Project Structure

```
api/
├── config/
│   └── prisma.js          # Prisma client setup
├── controllers/
│   ├── guideController.js
│   ├── bookingController.js
│   ├── userController.js
│   ├── reviewController.js
│   └── messageController.js
├── middleware/
│   └── errorHandler.js
├── routes/
│   ├── guideRoutes.js
│   ├── bookingRoutes.js
│   ├── userRoutes.js
│   ├── reviewRoutes.js
│   └── messageRoutes.js
├── prisma/
│   └── schema.prisma
├── .env
├── .gitignore
├── package.json
└── server.js
```

## TODO

- [ ] Implement JWT authentication middleware
- [ ] Add password hashing with bcryptjs
- [ ] Add input validation with express-validator
- [ ] Implement rate limiting
- [ ] Add file upload for images
- [ ] Integrate Stripe for payments
- [ ] Add email service for notifications
- [ ] Write API tests
- [ ] Add API documentation (Swagger)

## License

ISC
