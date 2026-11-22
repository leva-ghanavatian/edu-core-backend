# EduCore Backend

A **Node.js** and **Express** backend for an online course platform. It provides JWT authentication, role-based access control, course and lesson management with video uploads, course enrollment with discount codes, comments, notifications, and a contact/support inbox, all built on the **native MongoDB driver** with a custom, modular data-parsing layer.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
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
- [API Reference](#api-reference)
  - [Conventions](#conventions)
  - [Auth](#auth)
  - [Users](#users)
  - [Categories](#categories)
  - [Courses](#courses)
  - [Sessions (lessons)](#sessions-lessons)
  - [Comments](#comments)
  - [Contact](#contact)
  - [Notifications](#notifications)
  - [Implemented but not yet mounted](#implemented-but-not-yet-mounted)
- [Roles & Permissions](#roles--permissions)
- [File Uploads & Static Files](#file-uploads--static-files)
- [Author](#author)

---

## Features

- **Authentication**: register and log in with email or phone, `bcrypt`-hashed passwords, JWT bearer tokens (30-day expiry).
- **Role-based access control (RBAC)**: `USER` and `ADMIN` roles enforced through dedicated middleware at route level.
- **Courses and sessions**: admins create courses with a cover image and add lessons (sessions) with video uploads; each course records its creator.
- **Course enrollment**: authenticated users enroll in courses; the price is always taken from the database, never from the client.
- **Discount codes**: percentage-based codes limited per course and by maximum uses, consumed at enrollment.
- **Comments**: threaded comments (replies) on courses, deletable by the author or an admin.
- **Notifications**: admins send notifications to users; users list them and mark them as seen.
- **Contact inbox**: authenticated users submit contact requests with an optional attachment; admins reply by email and track status.
- **Custom data-parsing layer**: schema-driven validation, normalization, filtering, sorting, and pagination for every resource (`src/`).
- **Native MongoDB**: no ODM; collections and indexes are initialized on startup.
- **Versioned API**: all endpoints live under `/v1`.

## Tech Stack

| Layer          | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| Runtime        | Node.js (CommonJS)                                          |
| Framework      | Express 5                                                   |
| Database       | MongoDB (official native driver)                            |
| Auth           | JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing |
| Validation     | `fastest-validator`                                         |
| File uploads   | `multer`                                                    |
| Email          | `nodemailer` (Gmail service)                                |
| Request parsing| `body-parser`, `cors`                                       |
| Utilities      | `camelcase-keys`, `omit-empty`, `dotenv`                    |

## Architecture

The codebase is layered, so each concern lives in one place:

```
Request → Route → Middleware (auth / role / JSON check / upload)
        → Controller → Resource parser (src/) → Model → MongoDB
```

- **Routes** (`routes/v1`) define endpoints and attach middleware.
- **Middlewares** handle authentication, admin checks, JSON-body checks, camelCase normalization, uploads, and error handling.
- **Controllers** (`controllers/v1`) contain request-handling logic.
- **Resources and parsers** (`src/resources`, `src/parsing`) define each resource's schema and provide `parseCreate`, `parseUpdate`, `parseOnly`, `parseFilter`, and `parseSort`.
- **Models** (`models`) encapsulate all database access through the native MongoDB driver.
- **Helpers** (`helpers`) hold shared utilities: JWT signing, the upload factory, file cleanup, the mailer, and custom errors.

## Project Structure

```
edu-core-backend/
├── configs/
│   └── database.js         # MongoDB connection (lazy, shared client)
├── controllers/
│   └── v1/                 # Request handlers
├── helpers/                # Auth, uploader factory, mailer, errors, file cleanup
├── middlewares/
│   ├── auth.js             # requireAuth, requireAdmin
│   ├── http.js             # camelcase, requireJsonBody, notFound, errorHandler
│   └── upload.js           # Configured multer uploaders
├── models/                 # Database access layer + index initialization
├── public/                 # Static files served from the site root
│   └── courses/
│       └── covers/         # Course cover images
├── routes/
│   └── v1/                 # Route definitions
├── src/
│   ├── core/               # Validator instance and shared utilities
│   ├── parsing/            # Filter, sort, pagination, id, and resource builders
│   └── resources/          # Per-resource schemas (user, course, session, ...)
├── app.js                  # Express app + static file serving
├── server.js               # Entry point: middleware, routes, DB init, listen
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

The server initializes the database collections and indexes first, then starts listening. If the database is unreachable, it exits with an error. The API is available at `http://localhost:<PORT>/v1`.

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=4000

# Database
MONGO_URL=mongodb://localhost:27017
dbName=educore

# Authentication
JWT_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_long_random_string

# Email (Gmail SMTP, used for contact replies)
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
```

| Variable     | Required | Description                                                          |
| ------------ | -------- | -------------------------------------------------------------------- |
| `PORT`       | No       | Port the server listens on (defaults to `3000`)                      |
| `MONGO_URL`  | Yes      | MongoDB connection string                                            |
| `dbName`     | Yes      | Name of the database to use                                          |
| `JWT_SECRET` | Yes      | Secret used to sign and verify JSON Web Tokens                       |
| `SMTP_USER`  | Yes*     | Gmail account used to send emails (*needed for contact replies)      |
| `SMTP_PASS`  | Yes*     | Gmail app password (*needed for contact replies)                     |
| `NODE_ENV`   | No       | Set to `production` to hide stack traces in 500 error responses      |

> **Never commit your `.env` file.** It is already listed in `.gitignore`. Generate a unique `JWT_SECRET` for every environment, for example with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

## API Reference

All routes are prefixed with `/v1`. Example: `POST http://localhost:4000/v1/auth/login`.

**Access levels used below:**

| Level      | Meaning                                                        |
| ---------- | -------------------------------------------------------------- |
| **Public** | No token required                                              |
| **Auth**   | Valid JWT required (`USER` or `ADMIN`)                         |
| **Admin**  | Valid JWT whose role is `ADMIN`                                |

### Conventions

**Authentication.** Send the token returned by login/register in the `Authorization` header:

```
Authorization: Bearer <token>
```

**Request bodies.** Endpoints marked "JSON" require a JSON object body (`Content-Type: application/json`). Endpoints that upload files use `multipart/form-data`. Keys in bodies, params, and query strings are automatically converted to camelCase.

**Errors.** Errors return a JSON object with an HTTP status code:

```json
{ "error": "Route not found" }
```

| Status | Meaning                                                              |
| ------ | -------------------------------------------------------------------- |
| `400`  | Validation error, invalid JSON, or invalid file type                 |
| `401`  | Missing, invalid, or expired token                                   |
| `403`  | Authenticated but not allowed                                        |
| `404`  | Resource or route not found                                          |
| `409`  | Duplicate resource or conflict (e.g. a discount code no longer valid)|
| `413`  | Uploaded file or request body too large                              |
| `500`  | Internal server error                                                |

**Pagination.** List endpoints accept `page` (default `1`) and `limit` (default `20`, maximum `100`).

```
GET /v1/course?page=2&limit=10
```

**Sorting.** Use `sort` with a comma-separated list of fields. Prefix a field with `-` for descending order. Only the fields listed for each resource are sortable.

```
GET /v1/course?sort=-price,name
```

**Filtering.** Filter with `field=value` (equality) or `field__operator=value`. Only the fields listed for each resource are filterable.

| Operator | Meaning                         | Example                          |
| -------- | ------------------------------- | -------------------------------- |
| `eq`     | Equal (default)                 | `status=complete`                |
| `ne`     | Not equal                       | `status__ne=presell`             |
| `gt`, `gte` | Greater than (or equal)      | `price__gte=100`                 |
| `lt`, `lte` | Less than (or equal)         | `price__lt=500`                  |
| `in`, `nin` | In / not in a comma list (max 50) | `status__in=complete,presell` |
| `like`   | Case-insensitive contains (string fields only) | `name__like=java`  |

```
GET /v1/course?status=complete&price__lte=200&name__like=node&sort=-createdAt&limit=10
```

---

### Auth

| Method | Endpoint            | Access | Description                                    |
| ------ | ------------------- | ------ | ---------------------------------------------- |
| POST   | `/v1/auth/register` | Public | Create an account; returns `{ user, token }` (JSON) |
| POST   | `/v1/auth/login`    | Public | Log in with email **or** phone; returns `{ token, user }` (JSON) |
| GET    | `/v1/auth/me`       | Auth   | Get the currently logged-in user               |

**Register body:** `name`, `username`, `email`, `password` (8 to 72 characters), `phone`. Banned phone numbers cannot register.

**Login body:** `password` plus either `email` or `phone`.

### Users

| Method | Endpoint                | Access | Description                                                 |
| ------ | ----------------------- | ------ | ----------------------------------------------------------- |
| GET    | `/v1/user`              | Admin  | List users (paginated, filterable, sortable)                |
| GET    | `/v1/user/my-courses`   | Auth   | List the courses the current user is enrolled in            |
| GET    | `/v1/user/:id`          | Admin  | Get a user by id                                            |
| PATCH  | `/v1/user/me`           | Auth   | Update your own profile                                     |
| PATCH  | `/v1/user/:id`          | Admin  | Update any user (JSON)                                      |
| PATCH  | `/v1/user/:id/upgrade`  | Admin  | Promote a user to `ADMIN`                                   |
| PATCH  | `/v1/user/:id/penalty`  | Admin  | Set a user's `crime` (penalty) counter (JSON: `crime`)      |
| POST   | `/v1/user/ban`          | Admin  | Ban a phone number from registering (JSON: `phone`)         |
| DELETE | `/v1/user/:id`          | Admin  | Delete a user and their comments                            |

**Filter fields:** `name`, `username`, `email`, `phone`, `crime`, `role` (`USER` / `ADMIN`), `createdAt`, `updatedAt`
**Sort fields:** `name`, `username`, `crime`, `createdAt`, `updatedAt`

### Categories

| Method | Endpoint           | Access | Description                                   |
| ------ | ------------------ | ------ | --------------------------------------------- |
| GET    | `/v1/category`     | Public | List categories                               |
| GET    | `/v1/category/:id` | Public | Get a category                                |
| POST   | `/v1/category`     | Admin  | Create a category (JSON: `title`, `href`)     |
| PATCH  | `/v1/category/:id` | Admin  | Update a category (JSON)                      |
| DELETE | `/v1/category/:id` | Admin  | Delete a category                             |

`href` accepts lowercase letters, numbers, and dashes only (3 to 30 characters).
**Filter fields:** `title`, `href`, `createdAt`, `updatedAt` · **Sort fields:** `title`, `href`, `createdAt`, `updatedAt`

### Courses

| Method | Endpoint                  | Access | Description                                                              |
| ------ | ------------------------- | ------ | ------------------------------------------------------------------------ |
| GET    | `/v1/course`              | Public | List courses (paginated, filterable, sortable)                           |
| GET    | `/v1/course/:id`          | Public | Get a course                                                             |
| GET    | `/v1/course/:id/details`  | Public | Get a course with its related details (sessions, comments, etc.)         |
| GET    | `/v1/course/:id/related`  | Public | Up to 10 newest courses from the same category                           |
| POST   | `/v1/course/:id/comments` | Auth   | Comment on a course (JSON: `content`, optional `parent` for replies)     |
| POST   | `/v1/course/:id/enroll`   | Auth   | Enroll in a course (JSON, optional `code` for a discount code)           |
| POST   | `/v1/course`              | Admin  | Create a course (`multipart/form-data`, cover image in field `cover`)    |
| POST   | `/v1/course/:id/sessions` | Admin  | Add a session (`multipart/form-data`, video in field `video`)            |
| PATCH  | `/v1/course/:id`          | Admin  | Update a course (JSON)                                                   |
| DELETE | `/v1/course/:id`          | Admin  | Delete a course, its sessions, comments, cover, and videos               |

**Create course fields:** `name`, `description`, `support`, `href` (lowercase letters, numbers, dashes), `price` (≥ 0), `status` (`complete`, `presell`, or `in-progress`), `discount` (0 to 100, default `0`), `category` (category id), plus the `cover` file.

**Create session fields:** `title`, `duration` (seconds), `free` (`0` or `1`), plus the `video` file.

**Enrollment.** The final price is calculated server-side from the course price and, if a valid `code` is sent, its discount percentage. A code that is invalid, expired, or fully used returns `409`.

**Filter fields:** `name`, `status`, `category`, `price`, `creator`, `createdAt`, `updatedAt`
**Sort fields:** `name`, `price`, `createdAt`, `updatedAt` (default: newest first)

Course covers are returned as paths such as `/courses/covers/<file>.jpg` (see [File Uploads & Static Files](#file-uploads--static-files)).

### Sessions (lessons)

| Method | Endpoint          | Access | Description                                                                     |
| ------ | ----------------- | ------ | ------------------------------------------------------------------------------- |
| GET    | `/v1/session`     | Public | List sessions (filter with `?course=<courseId>`)                                |
| GET    | `/v1/session/:id` | Public | Get a session                                                                   |
| PATCH  | `/v1/session/:id` | Admin  | Update a session (JSON)                                                         |
| DELETE | `/v1/session/:id` | Admin  | Delete a session and its video file                                             |

Sessions are created through `POST /v1/course/:id/sessions`.
**Filter fields:** `title`, `free`, `course`, `duration`, `createdAt`, `updatedAt` · **Sort fields:** `title`, `duration`, `free`, `createdAt`, `updatedAt`

### Comments

| Method | Endpoint           | Access | Description                                                          |
| ------ | ------------------ | ------ | -------------------------------------------------------------------- |
| GET    | `/v1/comment`      | Public | List comments (filter with `?course=<courseId>` and/or `?parent=<id>`) |
| DELETE | `/v1/comment/:id`  | Auth   | Delete a comment (and its replies); author or admin only             |

Comments are created through `POST /v1/course/:id/comments`.
**Filter fields:** `course`, `parent`, `createdAt`, `updatedAt` · **Sort fields:** `createdAt`, `updatedAt`

### Contact

| Method | Endpoint                   | Access | Description                                                                 |
| ------ | -------------------------- | ------ | --------------------------------------------------------------------------- |
| POST   | `/v1/contact`              | Auth   | Submit a contact request (`multipart/form-data`, optional `attachment`)     |
| GET    | `/v1/contact`              | Admin  | List contact requests                                                       |
| POST   | `/v1/contact/:id/reply`    | Admin  | Email a reply to the sender and mark the request `RESOLVED` (JSON: `replyMessage`) |
| PATCH  | `/v1/contact/:id/status`   | Admin  | Update the request status (`NEW`, `IN_PROGRESS`, `RESOLVED`)                |

**Submit fields:** `name`, `email`, `subject`, `message`, optional `phone`, optional `attachment` file.
**Filter fields:** `email`, `status`, `createdAt` · **Sort fields:** `createdAt`, `status`

### Notifications

| Method | Endpoint                      | Access | Description                                                  |
| ------ | ----------------------------- | ------ | ------------------------------------------------------------ |
| POST   | `/v1/notification`            | Admin  | Send a notification to a user (JSON: `user`, `title`, `message`) |
| GET    | `/v1/notification`            | Auth   | List your own notifications (supports `?seen=true/false`)    |
| GET    | `/v1/notification/:id`        | Auth   | Get one notification (owner or admin)                        |
| PATCH  | `/v1/notification/:id/seen`   | Auth   | Mark one of your notifications as seen                       |

### Implemented but not yet mounted

The following route modules exist in `routes/v1/` but are **not registered in `server.js` yet**, so they are not reachable. Once mounted (for example `app.use("/v1/off", offRouter)`), they will expose:

| Module        | Endpoints                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `off.js`      | `GET /off/validate?code=&courseId=` (Auth), `POST /off` (Admin), `GET /off/course/:courseId` (Admin), `DELETE /off/:id` (Admin) |
| `department.js` | `GET /department` (Public), `GET /department/:id/subs` (Public), `POST /department` (Admin), `POST /department/subs` (Admin), `DELETE /department/:id` (Admin) |
| `ticket.js`   | `POST /ticket` (Auth), `GET /ticket/user` (Auth), `GET /ticket/:id/answer` (Auth), `GET /ticket` (Admin, unanswered), `POST /ticket/answer` (Admin) |

## Roles & Permissions

| Role      | Capabilities                                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Public**| Browse categories, courses, sessions, and comments; register and log in                                                           |
| **USER**  | Everything public, plus: view/update own profile, enroll in courses, comment, delete own comments, submit contact requests, read own notifications |
| **ADMIN** | Everything a user can do, plus: create/update/delete courses, sessions, and categories; manage users (update, promote, penalize, ban, delete); send notifications; manage and reply to contact requests |

New accounts are created with the `USER` role. An admin can promote a user through `PATCH /v1/user/:id/upgrade`.

## File Uploads & Static Files

Uploads are validated by both file extension and MIME type, and saved with a random UUID filename.

| Purpose            | Field        | Allowed types              | Max size | Stored in                      |
| ------------------ | ------------ | -------------------------- | -------- | ------------------------------ |
| Course cover       | `cover`      | `.jpg`, `.jpeg`, `.png`, `.webp` | 5 MB | `public/courses/covers/`       |
| Session video      | `video`      | `.mp4`, `.webm`            | 500 MB   | `public/courses/videos/`       |
| Contact attachment | `attachment` | `.jpg`, `.jpeg`, `.png`, `.pdf`, `.zip` | 10 MB | `public/contacts/attachments/` |

The `public/` folder is served statically from the site root, so a cover stored at `public/courses/covers/abc.jpg` is available at `http://localhost:<PORT>/courses/covers/abc.jpg`. Upload directories are created automatically on startup. Files are deleted from disk when their course, session, or failed contact submission is removed.

## Author

**Leva Ghanavatian**: [GitHub](https://github.com/leva-ghanavatian)
