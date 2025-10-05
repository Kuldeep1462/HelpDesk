# HelpDesk Mini

A modern ticketing system with SLA tracking, role-based access control, threaded comments, and searchable timeline. Built with Django REST Framework backend and React frontend.

## 🚀 Features

- **Ticket Management**: Create, update, and track support tickets
- **SLA Tracking**: Automatic deadline calculation based on priority and SLA hours
- **Role-Based Access**: Three user roles (user, agent, admin) with different permissions
- **Threaded Comments**: Nested comment system for ticket discussions
- **Searchable Timeline**: Track all ticket events with client-side filtering
- **Optimistic Locking**: Prevent concurrent update conflicts
- **Rate Limiting**: 60 requests per minute per user
- **Idempotency**: Safe retry for POST requests
- **Real-time Search**: Search tickets by title, description, and comments

## 🏗️ Tech Stack

### Backend
- **Django 5.0.7** - Web framework
- **Django REST Framework 3.15.2** - API framework
- **JWT Authentication** - Secure token-based auth
- **SQLite** - Database (easily configurable for production)

### Frontend
- **React 18.3.1** - UI library
- **React Router 6.26.2** - Client-side routing
- **Axios 1.7.4** - HTTP client
- **Tailwind CSS 3.4.13** - Styling
- **Vite 5.4.1** - Build tool

## 📋 API Endpoints

### Authentication
- `POST /users/api/register/` - User registration
- `POST /api/tokens/` - Login (JWT tokens)
- `GET /users/api/me/` - Get current user info

### Tickets
- `POST /api/tickets/` - Create ticket
- `GET /api/tickets/` - List tickets (with search & pagination)
- `GET /api/tickets/:id/` - Get ticket details
- `PATCH /api/tickets/:id/` - Update ticket (optimistic locking)
- `DELETE /api/tickets/:id/` - Delete ticket (admin only)
- `POST /api/tickets/:id/comments/` - Add comment

### Query Parameters
- `?search=` - Search in title, description, comments
- `?breached=true` - Filter breached SLA tickets
- `?limit=&offset=` - Pagination

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **User** | Create tickets, comment on own tickets |
| **Agent** | All user permissions + update any ticket, assign tickets |
| **Admin** | All permissions + delete tickets, manage users |

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd helpdesk

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🧪 Test Users

Create these users via Django admin or registration:

| Username | Password | Role |
|----------|----------|------|
| user1 | password123 | user |
| agent1 | password123 | agent |
| admin1 | password123 | admin |

## 📝 API Examples

### Create Ticket
```bash
curl -X POST http://localhost:8000/api/tickets/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: abc-123" \
  -d '{"title":"Printer down","description":"Office printer not working"}'
```

### List Tickets with Search
```bash
curl "http://localhost:8000/api/tickets/?limit=10&offset=0&search=printer" \
  -H "Authorization: Bearer <token>"
```

### Update Ticket Status
```bash
curl -X PATCH http://localhost:8000/api/tickets/1/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress","version":2}'
```

### Add Comment
```bash
curl -X POST http://localhost:8000/api/tickets/1/comments/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: cmt-1" \
  -d '{"content":"Looking into this issue","parent":null}'
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `helpdesk` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FRONTEND_ORIGIN=http://localhost:5173
```

### Database
The project uses SQLite by default. For production, update `DATABASES` in `helpdesk/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'helpdesk_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 🏗️ Project Structure

```
helpdesk-mini/
├── helpdesk/                 # Django backend
│   ├── helpdesk/            # Django project settings
│   ├── tickets/             # Tickets app
│   ├── users/               # Users app
│   ├── templates/           # Django templates
│   └── manage.py
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # API and auth utilities
│   │   └── styles/         # CSS files
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Backend (Django)
1. Set `DEBUG=False` in production
2. Configure production database
3. Set up static file serving
4. Use environment variables for secrets

### Frontend (React)
```bash
cd frontend
npm run build
```
Serve the `dist` folder with your preferred web server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues

If you encounter any issues, please create a new issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python version, etc.)


