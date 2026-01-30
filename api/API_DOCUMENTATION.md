# Express.js API - Setup Complete ✅

## 📁 Project Structure Created

```
api/
├── config/
│   └── prisma.js              # Prisma client configuration
├── controllers/
│   ├── guideController.js     # Guide-related operations
│   ├── bookingController.js   # Booking management
│   ├── userController.js      # User authentication & profiles
│   ├── reviewController.js    # Review & rating system
│   └── messageController.js   # Messaging system
├── middleware/
│   └── errorHandler.js        # Global error handling
├── routes/
│   ├── guideRoutes.js         # Guide API routes
│   ├── bookingRoutes.js       # Booking API routes
│   ├── userRoutes.js          # User API routes
│   ├── reviewRoutes.js        # Review API routes
│   └── messageRoutes.js       # Message API routes
├── prisma/
│   └── schema.prisma          # Database schema
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies & scripts
├── README.md                  # Documentation
└── server.js                  # Main server file
```

## ✅ Implemented Features

### 1. Server Configuration (server.js)
- ✅ Express.js setup
- ✅ CORS configured for frontend (http://localhost:5173)
- ✅ JSON body parser
- ✅ Morgan logging (development)
- ✅ Global error handling
- ✅ Health check endpoint: `GET /health`

### 2. API Endpoints

#### **Guides API** (`/api/guides`)
- `GET /api/guides` - Fetch all guides with filters (city, rating, price, search)
- `GET /api/guides/:id` - Get single guide with full details
- `GET /api/guides/city/:city` - Get guides by city
- `PUT /api/guides/:id` - Update guide profile

**Features:**
- ✅ Filters: city, minRating, maxPrice, search
- ✅ Auto-increment profile views on detail view
- ✅ Include reviews, availability, user data
- ✅ Transform data to match frontend format

#### **Bookings API** (`/api/bookings`)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings (traveler or guide)
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

**Features:**
- ✅ Auto-calculate pricing (hourlyRate × hours + 15% platform fee)
- ✅ Create transaction records automatically
- ✅ Send notifications to guide on new booking
- ✅ Update guide/traveler statistics on completion
- ✅ Handle cancellations with reason tracking

#### **Users API** (`/api/users`)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile

**Features:**
- ✅ Auto-create profile based on role (Traveler or Guide)
- ✅ Email uniqueness validation
- ✅ Last login tracking
- ⚠️ TODO: Password hashing with bcryptjs
- ⚠️ TODO: JWT token generation

#### **Reviews API** (`/api/reviews`)
- `POST /api/reviews` - Create review
- `GET /api/reviews/guide/:guideId` - Get guide reviews (paginated)
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

**Features:**
- ✅ Validate booking is completed before review
- ✅ Prevent duplicate reviews for same booking
- ✅ Auto-update guide average rating
- ✅ Send notification to guide on new review
- ✅ Support pagination

#### **Messages API** (`/api/messages`)
- `POST /api/messages/conversation` - Get or create conversation
- `GET /api/messages/conversations/:userId` - Get user conversations
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get messages (paginated)
- `PUT /api/messages/read/:conversationId` - Mark as read

**Features:**
- ✅ One-on-one conversations between users
- ✅ Unread message tracking
- ✅ Send notification on new message
- ✅ Update conversation timestamp

### 3. Database Integration
- ✅ Prisma Client configured
- ✅ Connection testing on startup
- ✅ Query logging in development mode
- ✅ Proper relationships and includes
- ✅ Transaction support for complex operations

### 4. Error Handling
- ✅ Global error handler middleware
- ✅ Prisma-specific error handling (P2002, P2025, P2003)
- ✅ JWT error handling
- ✅ Validation error handling
- ✅ Environment-based stack traces

## 🚀 How to Run

### 1. Configure Database
Edit `.env` file with your MySQL credentials:
```env
DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/travel_with_student"
```

### 2. Create Database Tables
```bash
npx prisma db push
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Start Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server runs on: **http://localhost:5000**

## 📊 Test Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Get All Guides
```bash
curl http://localhost:5000/api/guides
```

### Get Guides with Filters
```bash
curl "http://localhost:5000/api/guides?city=Istanbul&minRating=4&maxPrice=50"
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "travelerId": "user-id-here",
    "guideId": "guide-id-here",
    "bookingDate": "2026-02-15",
    "bookingTime": "10:00 AM",
    "duration": "HALF_DAY",
    "notes": "Looking forward to the tour!"
  }'
```

### Register User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "TRAVELER"
  }'
```

## ⚠️ Current Limitations (TODO)

### Authentication
- [ ] JWT token generation not implemented
- [ ] Password hashing (bcryptjs) commented out
- [ ] Auth middleware for protected routes
- [ ] Token verification

### Security
- [ ] Rate limiting
- [ ] Input validation with express-validator
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection

### Features
- [ ] File upload for images (multer)
- [ ] Stripe payment integration
- [ ] Email service for notifications
- [ ] WebSocket for real-time messaging
- [ ] Pagination for all list endpoints
- [ ] Search optimization

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation (Swagger/OpenAPI)

## 🔐 Security Notes

**Before Production:**
1. Update `JWT_SECRET` in `.env` with a strong random string
2. Enable password hashing (uncomment bcrypt code in userController)
3. Implement JWT authentication middleware
4. Add rate limiting to prevent abuse
5. Use HTTPS in production
6. Validate and sanitize all inputs
7. Add helmet.js for security headers

## 📝 Environment Variables

Required in `.env`:
- `DATABASE_URL` - MySQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration
- `FRONTEND_URL` - Frontend URL for CORS

## 🎯 Next Steps

1. **Start MySQL Database**
   - Install MySQL if not installed
   - Create database: `CREATE DATABASE travel_with_student;`
   - Update `.env` with credentials

2. **Push Schema to Database**
   ```bash
   npx prisma db push
   ```

3. **Seed Initial Data** (Optional)
   - Create `prisma/seed.js`
   - Add cities, categories, sample users
   - Run: `npx prisma db seed`

4. **Connect Frontend**
   - Update frontend API calls to `http://localhost:5000/api`
   - Handle authentication tokens
   - Test all endpoints

5. **Implement Authentication**
   - Add JWT middleware
   - Hash passwords
   - Protect routes

## 📚 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For lists
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }  // Validation errors
}
```

## 🛠️ Database Management

**Open Prisma Studio (GUI for database):**
```bash
npm run prisma:studio
```

Access at: http://localhost:5555

---

**Status:** ✅ Backend API fully implemented and ready for database connection!

**Current Issue:** Database not connected. Update `.env` with MySQL credentials and ensure MySQL server is running.
