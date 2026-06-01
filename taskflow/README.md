# ⚡ TaskFlow — Project & Task Management System

A full-stack web application to manage projects and tasks for teams.  
Built with **FastAPI** (Python) + **React.js** — perfect for demonstrating real-world development skills.

![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Tech Stack](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)
![Tech Stack](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite)
![Tech Stack](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login & registration with token-based auth
- 📁 **Project Management** — Create, update, and delete projects
- ✅ **Task Management** — Assign tasks with priority, status, and due dates
- 📊 **Dashboard** — Live stats: total tasks, completion rate, high priority items
- 🔍 **Filter Tasks** — Filter by status (To Do / In Progress / Done) and priority
- 👥 **User Assignment** — Assign tasks to team members
- 🎨 **Dark UI** — Modern glassmorphism dark theme

---

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Backend    | FastAPI, Python 3.11    |
| Database   | SQLite + SQLAlchemy ORM |
| Auth       | JWT (python-jose + passlib bcrypt) |
| Frontend   | React 18, React Router v6 |
| HTTP Client| Axios                   |
| Styling    | Vanilla CSS (dark theme)|

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: **http://localhost:8000**  
API Docs (Swagger): **http://localhost:8000/docs**

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs at: **http://localhost:3000**

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── main.py          # FastAPI app + dashboard endpoint
│   ├── database.py      # SQLAlchemy DB setup (SQLite)
│   ├── models.py        # User, Project, Task DB models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── auth.py          # JWT token logic + password hashing
│   └── routers/
│       ├── auth.py      # /auth/register, /auth/login, /auth/me
│       ├── projects.py  # CRUD for projects
│       └── tasks.py     # CRUD for tasks + filter support
└── frontend/
    └── src/
        ├── context/     # AuthContext (global auth state)
        ├── services/    # Axios API calls
        ├── components/  # Sidebar
        └── pages/       # Login, Register, Dashboard, Projects, Tasks
```

---

## 🔗 API Endpoints

| Method | Endpoint              | Description              | Auth |
|--------|-----------------------|--------------------------|------|
| POST   | /auth/register        | Register new user        | ❌   |
| POST   | /auth/login           | Login, get JWT token     | ❌   |
| GET    | /auth/me              | Get current user         | ✅   |
| GET    | /projects/            | List all projects        | ✅   |
| POST   | /projects/            | Create project           | ✅   |
| PUT    | /projects/{id}        | Update project           | ✅   |
| DELETE | /projects/{id}        | Delete project           | ✅   |
| GET    | /tasks/               | List tasks (with filter) | ✅   |
| POST   | /tasks/               | Create task              | ✅   |
| PUT    | /tasks/{id}           | Update task              | ✅   |
| DELETE | /tasks/{id}           | Delete task              | ✅   |
| GET    | /dashboard/stats      | Dashboard statistics     | ✅   |

---

## 💡 Key Concepts Used

- **REST API design** with proper HTTP methods and status codes
- **JWT-based stateless authentication**
- **SQLAlchemy ORM** for database operations
- **Pydantic** for data validation
- **React Context API** for global state management
- **Axios interceptors** for automatic token injection
- **React Router v6** for client-side routing
- **CORS middleware** for cross-origin requests

---

## 📄 License

MIT License — free to use for portfolio purposes.
