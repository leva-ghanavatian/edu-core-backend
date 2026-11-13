# EduCore Backend

A robust **Node.js** and **Express** backend for a multi-teacher educational platform. It provides secure video uploads, role-based access control, course enrollment, and a highly modular, custom data-parsing architecture built directly on the **native MongoDB driver**.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Native%20Driver-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Roles & Permissions](#roles--permissions)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Multi-teacher platform**: multiple teachers can create and manage their own courses independently.
- **Role-based access control (RBAC)**: route-level protection through dedicated middleware.
- **Course enrollment**: students can enroll in courses and access their content.
- **Secure video uploads**: validated and protected upload pipeline for lesson videos.
- **Course cover images**: static asset serving for course covers.
- **Custom data-parsing layer**: modular helpers that validate, normalize, and transform data before it reaches the database.
- **Native MongoDB**: no ODM; full control over queries, indexes, and schema logic.
- **Versioned API**: all endpoints are served under `/api/v1` for forward compatibility.

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Runtime        | Node.js (CommonJS)                              |
| Framework      | Express 5                                       |
| Database       | MongoDB (official native driver)                |
| Auth           | JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing |
| Validation     | `fastest-validator`                             |
| File uploads   | `multer`                                        |
| Email          | `nodemailer` (SMTP)                             |
| Security       | `helmet`, `cors`                                |
| Logging        | `morgan`                                        |
| Utilities      | `camelcase-keys`, `omit-empty`, `dotenv`        |

## Architecture

The codebase follows a layered, modular structure that separates concerns clearly:

```
Request → Route → Middleware (auth / role / validation) → Controller → Helper (parsing) → Model → MongoDB
```

- **Routes** define endpoints and attach middleware.
- **Middlewares** handle authentication, authorization, and upload validation.
- **Controllers** contain request-handling logic.
- **Helpers** implement the custom data-parsing and transformation layer.
- **Models** encapsulate all database access through the native MongoDB driver.

## Project Structure

```
edu-core-backend/
├── configs/            # Application and database configuration
├── controllers/
│   └── v1/             # Request handlers (API v1)
├── helpers/            # Data parsing, validation, and utility functions
├── middlewares/        # Auth, role guards, upload handling, etc.
├── models/             # Database access layer (native MongoDB)
├── public/
│   └── courses/
│       └── covers/     # Course cover images
├── routes/
│   └── v1/             # Route definitions (API v1)
├── src/                # Additional source modules
├── app.js              # Express app setup (middleware, routes)
├── server.js           # Server entry point
└── package.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/leva-ghanavatian/edu-core-backend.git
cd edu-core-backend

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root (see Environment Variables below)

# 4. Start the server
npm run dev
```

The API will be available at `http://localhost:<PORT>/api/v1`.

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=4000

# Database
MONGO_URL=mongodb://localhost:27017
dbName=sabzlearn

# Authentication
JWT_SECRET=replace_with_a_long_random_string

# Email (SMTP)
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
```

| Variable     | Description                                              |
| ------------ | -------------------------------------------------------- |
| `PORT`       | Port the server listens on                               |
| `MONGO_URL`  | MongoDB connection string                                |
| `dbName`     | Name of the database to use                              |
| `JWT_SECRET` | Secret used to sign JSON Web Tokens                      |
| `SMTP_USER`  | SMTP account used to send emails                         |
| `SMTP_PASS`  | SMTP password (for Gmail, use an app password)          |

> **Never commit your `.env` file.** Keep it in `.gitignore`, and generate a unique `JWT_SECRET` for every environment, for example with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

## API Overview

All routes are prefixed with `/api/v1`.

| Area        | Description                                      |
| ----------- | ------------------------------------------------ |
| Auth        | Registration, login, and session handling        |
| Users       | User profiles and role management                |
| Courses     | Create, read, update, delete courses (teachers)  |
| Enrollment  | Enroll in and list courses (students)            |
| Videos      | Secure lesson video upload and retrieval         |

<!-- Replace this table with your actual endpoints, e.g.:
| Method | Endpoint                 | Access   | Description        |
| ------ | ------------------------ | -------- | ------------------ |
| POST   | /api/v1/auth/login       | Public   | Log in a user      |
| GET    | /api/v1/courses          | Auth     | List courses       |
-->

## Roles & Permissions

| Role        | Capabilities                                                      |
| ----------- | ----------------------------------------------------------------- |
| **Student** | Browse courses, enroll, access enrolled content                   |
| **Teacher** | Create and manage own courses, upload lesson videos               |
| **Admin**   | Manage users and platform-wide resources                          |


## Author

**Leva Ghanavatian**: [GitHub](https://github.com/leva-ghanavatian)
