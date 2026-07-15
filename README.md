# 🎫 Support Ticket Management System

> A lightweight helpdesk application for creating, tracking, and managing support tickets with priority and status tracking.

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
  - [Tickets](#tickets)
  - [Customers](#customers)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [GitHub Workflow](#github-workflow)
- [Team Members](#team-members)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 About The Project

The **Support Ticket Management System** is a RESTful API backend built for managing customer support tickets. It allows support teams to:

- Create, view, update, and delete tickets
- Track ticket status (Open, In Progress, Closed)
- Assign priority levels (Low, Medium, High)
- Manage customer information
- Search tickets by keyword
- View dashboard statistics

This is the backend component of a full-stack web application, built as part of the CODOC Intern Development Programme assignment.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ✅ **Ticket CRUD** | Create, Read, Update, Delete support tickets |
| ✅ **Customer CRUD** | Manage customer details |
| ✅ **Priority Levels** | Low, Medium, High |
| ✅ **Status Tracking** | Open, In Progress, Closed |
| ✅ **Search Tickets** | Search by subject or customer name |
| ✅ **Dashboard Stats** | Get counts by status (Open, In Progress, Closed) |
| ✅ **SQLite Database** | Lightweight, file-based persistence |
| ✅ **RESTful API** | Clean, consistent endpoint design |
| ✅ **Error Handling** | Proper validation and error responses |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js + Express |
| **Database** | SQLite3 |
| **API Testing** | Postman / Browser |
| **Version Control** | Git + GitHub |
| **Development** | Nodemon (auto-reload) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recommended)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Bilalmughal-07/support-ticket-management-system.git
cd support-ticket-management-system
```

2. **Switch to the backend branch**

```bash
git checkout issue-1-backend-database-setup
```

3. **Install dependencies**

```bash
npm install
```

4. **Approve SQLite3 build scripts** (if prompted)

```bash
npm approve-scripts sqlite3
```

5. **Verify the `package.json` scripts**

Ensure your `package.json` has these scripts:

```json
"scripts": {
  "start": "node server/server.js",
  "dev": "nodemon server/server.js"
}
```

### Running the Server

Start the development server with auto-reload:

```bash
npm run dev
```

You should see:

```
✅ Connected to SQLite database.
✅ Schema created.
✅ Seed data inserted.
✅ Server is listening on http://localhost:5000
```

The API will be available at: `http://localhost:5000`

---

## 📡 API Endpoints

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tickets` | Get all tickets |
| `GET` | `/api/tickets/:id` | Get a single ticket by ID |
| `GET` | `/api/tickets/stats` | Get dashboard statistics |
| `GET` | `/api/tickets/search?keyword=...` | Search tickets by keyword |
| `POST` | `/api/tickets` | Create a new ticket |
| `PUT` | `/api/tickets/:id` | Update a ticket |
| `DELETE` | `/api/tickets/:id` | Delete a ticket |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/customers` | Get all customers |
| `GET` | `/api/customers/:id` | Get a single customer by ID |
| `POST` | `/api/customers` | Create a new customer |
| `PUT` | `/api/customers/:id` | Update a customer |
| `DELETE` | `/api/customers/:id` | Delete a customer |

### Example: Create a Ticket

**Request**

```http
POST /api/tickets
Content-Type: application/json

{
  "customer_id": 1,
  "subject": "Cannot login to account",
  "description": "User reports error after password reset.",
  "priority": "High",
  "status": "Open"
}
```

**Response**

```json
{
  "id": 5,
  "message": "Ticket created"
}
```

---

## 🗄️ Database Schema

### Tables

**customers**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key, auto-increment |
| `name` | TEXT | Customer name (required) |
| `email` | TEXT | Email address (unique, required) |
| `phone` | TEXT | Phone number |

**tickets**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key, auto-increment |
| `customer_id` | INTEGER | Foreign key to customers.id |
| `subject` | TEXT | Ticket subject (required) |
| `description` | TEXT | Detailed description |
| `priority` | TEXT | Low, Medium, High (default: Medium) |
| `status` | TEXT | Open, In Progress, Closed (default: Open) |
| `created_at` | DATETIME | Auto-generated timestamp |
| `updated_at` | DATETIME | Auto-updated timestamp |

### Relationships

- A **customer** can have many **tickets** (one-to-many)
- Deleting a customer will cascade delete all their tickets

---

## 📁 Project Structure

```
support-ticket-management-system/
├── server/
│   ├── routes/
│   │   ├── tickets.js          # Ticket route definitions
│   │   └── customers.js        # Customer route definitions
│   ├── controllers/
│   │   ├── ticketsController.js   # Ticket business logic
│   │   └── customersController.js # Customer business logic
│   ├── models/
│   │   ├── ticketModel.js      # Ticket database queries
│   │   └── customerModel.js    # Customer database queries
│   ├── config/
│   │   └── database.js         # SQLite connection & setup
│   └── server.js               # Main Express server
├── database/
│   ├── schema.sql              # Table creation scripts
│   └── seed.sql                # Sample data
├── .gitignore
├── package.json
└── README.md
```

---

## 🔄 GitHub Workflow

This project follows the required **Issue → Branch → Commit → PR → Review → Merge → Close** workflow.

| Step | Description |
|------|-------------|
| 1️⃣ **Issue** | Created GitHub Issue #1: "Set up backend API and database for tickets & customers" |
| 2️⃣ **Branch** | Created branch `issue-1-backend-database-setup` from `main` |
| 3️⃣ **Commits** | Made multiple meaningful commits with `feat:` prefix |
| 4️⃣ **Pull Request** | Opened PR with description linking to the issue |
| 5️⃣ **Review** | PR reviewed by at least one team member |
| 6️⃣ **Merge** | PR merged into `main` after approval |
| 7️⃣ **Close** | Issue closed with a comment summarizing the work |

### Commit Message Examples

```
feat: add database schema and seed data
feat: implement ticket and customer models
feat: add controllers and routes for CRUD operations
feat: implement search and dashboard stats endpoints
```

---

## 👥 Team Members

| Role | Name | GitHub |
|------|------|--------|
| Team Lead / Git Manager | Bilal Mughal | [@Bilalmughal-07](https://github.com/Bilalmughal-07) |
| Backend / API Engineer | Abdul Azeem Hashmi | [@AbdulAzeemHashmi](https://github.com/AbdulAzeemHashmi) |
| Database Engineer | Abdul Azeem Hashmi | [@AbdulAzeemHashmi](https://github.com/AbdulAzeemHashmi) |
| Frontend Engineer | (Team Member 3) | - |
| QA / Documentation | (Team Member 4) | - |

---

## 🤝 Contributing

1. Create a new issue for your task
2. Create a branch from `main` with the naming convention: `issue-N-brief-description`
3. Make meaningful commits
4. Open a Pull Request
5. Request a review from a teammate
6. After approval, merge and close the issue

---

## 📄 License

This project is for educational purposes as part of the CODOC Intern Development Programme.

---

## 🙏 Acknowledgments

- CODOC (PRIVATE) LIMITED for providing this learning opportunity
- The internship team for collaboration and support

---

**Built with ❤️ by the Support Ticket Management Team**
