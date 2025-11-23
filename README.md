# 🚀 Full-Featured Social Media Application

A modern, feature-rich social media application built with **FastAPI** (backend) and **React** (frontend). This application provides a complete social networking experience with posts, comments, likes, follows, and real-time activity tracking.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)
![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### User Management
- 🔐 **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (User, Admin, Owner)
  - Secure password hashing

### Social Features
- 📝 **Posts**
  - Create posts with text, images, or videos
  - Edit and delete your own posts
  - Repost/share functionality
  - Rich media support

- ❤️ **Interactions**
  - Like/unlike posts
  - Comment on posts
  - Bookmark posts for later
  - Real-time feed updates

- 👥 **Following System**
  - Follow/unfollow other users
  - View followers and following lists
  - Personalized feed based on followed users

- 🚫 **Privacy & Safety**
  - Block users
  - Blocked users' content is automatically hidden
  - Mutual content hiding when blocked

- 📊 **Activity Tracking**
  - Activity feed showing recent actions
  - Track posts, likes, follows, and comments
  - Activity wall for user engagement

### Additional Features
- 🔔 **Notifications** (Server-Sent Events)
- 🖼️ **Profile Management** (Profile pictures, cover photos)
- 🔗 **Social Links**
- 🏷️ **Hashtags**
- 📱 **Responsive UI**

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **Migrations**: Alembic
- **Image Storage**: Cloudinary
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: React 19.2
- **Build Tool**: Vite 7.2
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Language**: TypeScript

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd social-media-app
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\\venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the root directory:

```env
DEBUG=True
SERVER_PORT=5001
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/social_media_db
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Setup Database

```bash
# Create database
createdb social_media_db

# Run migrations
alembic upgrade head

# (Optional) Seed data
python seed_data.py
```

#### Start Backend Server

```bash
python main.py
```

Backend will be running at `http://localhost:5001`
- API Documentation: `http://localhost:5001/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:5173`

## 📁 Project Structure

```
├── api/                      # Backend API
│   └── v1/
│       ├── models/          # SQLAlchemy models
│       ├── routes/          # API endpoints
│       ├── schemas/         # Pydantic schemas
│       ├── services/        # Business logic
│       ├── responses/       # Response handlers
│       └── utils/           # Utility functions
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── alembic/                # Database migrations
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Posts
- `GET /api/v1/posts` - Get feed
- `POST /api/v1/posts` - Create post
- `PATCH /api/v1/posts/{id}` - Update post
- `DELETE /api/v1/posts/{id}` - Delete post
- `POST /api/v1/posts/{id}/like` - Like/unlike post
- `POST /api/v1/posts/{id}/comment` - Add comment
- `GET /api/v1/posts/{id}/comments` - Get comments
- `POST /api/v1/posts/{id}/bookmark` - Bookmark post

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/{username}` - Get user profile
- `POST /api/v1/users/{id}/follow` - Follow/unfollow user
- `POST /api/v1/users/{id}/block` - Block user

### Activity
- `GET /api/v1/activity` - Get activity feed

For complete API documentation, visit `http://localhost:5001/docs` when the server is running.

## 🧪 Testing

### Backend Tests
```bash
python verify_backend.py
```

### Frontend Build
```bash
cd frontend
npm run build
```

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

**Import Errors**
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**API Connection Failed**
- Verify backend is running on port 5001
- Check CORS settings in `main.py`
- Verify API base URL in `frontend/src/utils/api.ts`

**Build Errors**
- Delete `node_modules` and reinstall: `npm install`
- Clear cache: `npm cache clean --force`

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DEBUG` | Enable debug mode | Yes |
| `SERVER_PORT` | Backend server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `SECRET_KEY` | JWT secret key | Yes |
| `ALGORITHM` | JWT algorithm (HS256) | Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | Yes |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- FastAPI for the amazing web framework
- React team for the frontend library
- All contributors who helped improve this project

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ using FastAPI and React**
