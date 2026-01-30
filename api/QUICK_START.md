# 🚀 Quick Start Guide

## Current Status: Server is Running, Waiting for Database Connection

The Express.js API has been successfully created and is trying to start. However, it cannot connect to the MySQL database yet.

## ⚡ Quick Setup Steps

### Step 1: Install and Start MySQL

#### Option A: XAMPP (Easiest for Windows)
1. Download XAMPP: https://www.apachefriends.org/
2. Install and start Apache + MySQL
3. Access phpMyAdmin: http://localhost/phpmyadmin
4. Create database: `travel_with_student`

#### Option B: MySQL Standalone
1. Download MySQL: https://dev.mysql.com/downloads/mysql/
2. Install MySQL Server
3. Start MySQL service
4. Create database using MySQL Workbench or CLI

### Step 2: Update Database Connection

Edit `api/.env` file:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/travel_with_student"
```

**Default XAMPP credentials:**
```env
DATABASE_URL="mysql://root:@localhost:3306/travel_with_student"
```
(Empty password for XAMPP default)

### Step 3: Create Database Schema

```bash
cd "c:/Users/yusuf.pinarci/Desktop/travel with student/api"
npx prisma db push
```

This will create all tables in your database.

### Step 4: Verify Server is Running

The server should automatically restart (nodemon is watching).

Check health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Travel with Student API is running",
  "timestamp": "2026-01-21T..."
}
```

## 🧪 Test the API

### 1. Register a New User (Traveler)
```bash
curl -X POST http://localhost:5000/api/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"traveler@test.com\",\"password\":\"password123\",\"name\":\"John Traveler\",\"role\":\"TRAVELER\"}"
```

### 2. Register a Guide
```bash
curl -X POST http://localhost:5000/api/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"guide@test.com\",\"password\":\"password123\",\"name\":\"Sarah Guide\",\"role\":\"STUDENT_GUIDE\"}"
```

### 3. Get All Guides
```bash
curl http://localhost:5000/api/guides
```

## 📊 Database Management

### Open Prisma Studio (Visual Database Editor)
```bash
cd "c:/Users/yusuf.pinarci/Desktop/travel with student/api"
npx prisma studio
```

Access at: http://localhost:5555

Here you can:
- View all tables
- Add/edit/delete records
- See relationships
- Export data

## 🔗 Connect Frontend to Backend

### Update Frontend API Configuration

In your React app, create an API client:

**Create `travel-app/src/api/client.ts`:**
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

**Example: Fetch Guides**
```typescript
import apiClient from './api/client';

// In your component or context
const fetchGuides = async () => {
  try {
    const response = await apiClient.get('/guides');
    setGuides(response.data.data);
  } catch (error) {
    console.error('Error fetching guides:', error);
  }
};
```

## 📁 Project Structure Recap

```
api/
├── server.js              ← Main entry point
├── config/
│   └── prisma.js         ← Database connection
├── controllers/          ← Business logic
│   ├── guideController.js
│   ├── bookingController.js
│   ├── userController.js
│   ├── reviewController.js
│   └── messageController.js
├── routes/               ← API endpoints
│   ├── guideRoutes.js
│   ├── bookingRoutes.js
│   ├── userRoutes.js
│   ├── reviewRoutes.js
│   └── messageRoutes.js
├── middleware/
│   └── errorHandler.js   ← Global error handling
└── prisma/
    └── schema.prisma     ← Database schema
```

## 🎯 All Available Endpoints

### Authentication
- `POST /api/users/register` - Register
- `POST /api/users/login` - Login
- `GET /api/users/profile/:id` - Get profile
- `PUT /api/users/profile/:id` - Update profile

### Guides
- `GET /api/guides` - List all guides
- `GET /api/guides/:id` - Guide details
- `GET /api/guides/city/:city` - Guides by city
- `PUT /api/guides/:id` - Update guide profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings?userId=xxx&role=TRAVELER` - My bookings
- `GET /api/bookings/:id` - Booking details
- `PUT /api/bookings/:id/status` - Update status
- `DELETE /api/bookings/:id` - Cancel booking

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/guide/:guideId` - Guide reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Messages
- `POST /api/messages/conversation` - Get/create conversation
- `GET /api/messages/conversations/:userId` - User conversations
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get messages
- `PUT /api/messages/read/:conversationId` - Mark as read

## ⚠️ Important Notes

### Security (Before Production)
1. The current setup uses **temporary authentication**
2. Passwords are **NOT hashed** yet (TODO)
3. JWT tokens are **placeholder strings** (TODO)
4. Add authentication middleware before production

### Recommended Next Steps
1. ✅ Start MySQL server
2. ✅ Update DATABASE_URL in .env
3. ✅ Run `npx prisma db push`
4. ⚠️ Implement JWT authentication
5. ⚠️ Add password hashing
6. ⚠️ Create seed data for testing
7. ⚠️ Connect frontend to backend

## 🐛 Troubleshooting

### Server Won't Start
- Check if port 5000 is already in use
- Run: `netstat -ano | findstr :5000`
- Kill process if needed

### Database Connection Error
- Ensure MySQL is running
- Check username/password in .env
- Verify database exists: `SHOW DATABASES;`
- Check port 3306 is accessible

### CORS Errors from Frontend
- Verify FRONTEND_URL in .env matches your React app
- Check server logs for CORS errors
- Restart server after .env changes

### Prisma Generate Fails
- Delete `node_modules/@prisma`
- Run `npm install`
- Run `npx prisma generate` again

## 📞 Support

Check the detailed documentation in `API_DOCUMENTATION.md` for:
- Complete API reference
- Request/response examples
- Error handling
- Database schema details
- Security implementation guide

---

**You're all set!** Just connect the database and start building! 🎉
