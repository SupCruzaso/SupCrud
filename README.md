# 🛡️ SupCrud by Crudzaso

> **SaaS PQRS Management Platform** > Multi-tenant platform with embeddable widgets, AI-assisted routing, and dual-database architecture.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Backend Structure](#5-backend-structure)
6. [Frontend Structure](#6-frontend-structure)
7. [Deployment](#7-deployment)

---

## 1. Project Overview

**SupCrud by Crudzaso** is a professional SaaS solution designed for managing PQRS (Petitions, Queries, Reclaims, Suggestions). It allows businesses to integrate a support system into any website via an embeddable JS widget.

### Key Capabilities:

- **Multi-workspace Isolation:** Strict data separation between clients.
- **Embeddable Widget:** Zero-account ticket creation for end-users.
- **OTP Verification:** Secure access to sensitive ticket data without passwords.
- **AI Assist:** Automated ticket classification and priority suggestions.
- **Role-Based Access (RBAC):** Owner Global, Workspace Admin, and Agent roles.

---

## 2. Architecture

The system is composed of a single Express API that serves as the central hub for all client interactions. Clients include the landing page, the Owner Global panel, the Workspace panel, the embeddable widget, and the Docusaurus documentation site — all of them communicate with the API exclusively over HTTP REST. The API connects to two databases: PostgreSQL handles everything related to identity and control (users, workspaces, roles, add-ons), while MongoDB Atlas stores operational data (tickets, events, OTP records). On top of the databases, the API integrates three external services: Cloudinary for file storage when the Attachments add-on is active, OpenAI for ticket classification when the AI Assist add-on is active, and Nodemailer over SMTP for sending OTP codes and ticket notifications to end users.

---

## 3. Tech Stack

| Layer                       | Technology                | Purpose                            |
| :-------------------------- | :------------------------ | :--------------------------------- |
| **Backend Runtime**         | Node.js 22 + Express 4    | REST API Core                      |
| **API Documentation**       | Swagger UI                | `/api-docs` endpoint               |
| **SQL Database**            | PostgreSQL (Sequelize/pg) | Identity, Auth & Workspaces        |
| **NoSQL Database**          | MongoDB Atlas (Mongoose)  | Tickets, Events & OTP              |
| **Authentication**          | JWT + Passport.js         | Session management & Google OAuth  |
| **Cloud Storage**           | Cloudinary SDK            | Attachment management              |
| **Artificial Intelligence** | OpenAI Node SDK           | AI Assist (classification/routing) |
| **Frontend Styling**        | Tailwind CSS v4           | Rapid UI development               |
| **Documentation**           | Docusaurus 3              | Technical & User docs              |

---

## 4. Monorepo Structure

```text
supcrud/
├── .github/                      ← PR Templates & Workflows
├── backend/                      ← Express API & Business Logic
├── frontend/                     ← UI Panels & Embeddable Widget
├── docs/                         ← Docusaurus site
├── docker-compose.yml            ← Optional: local dev environment
└── README.md
```

---

## 5. Backend Structure

````text
backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── database.sql.js       ← PostgreSQL connection (pg / Sequelize)
│   │   ├── database.mongo.js     ← MongoDB connection (Mongoose)
│   │   ├── cloudinary.js         ← Cloudinary SDK setup
│   │   ├── openai.js             ← OpenAI client setup
│   │   └── swagger.js            ← Swagger/OpenAPI definition
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/                 ← TASK-02
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   │
│   │   ├── workspaces/           ← TASK-02 + TASK-03
│   │   │   ├── workspace.routes.js
│   │   │   ├── workspace.controller.js
│   │   │   ├── workspace.service.js
│   │   │   ├── workspace.model.js      ← Sequelize model (SQL)
│   │   │   └── workspace.validation.js
│   │   │
│   │   ├── users/                ← TASK-02
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   ├── user.model.js           ← Sequelize model (SQL)
│   │   │   └── user.validation.js
│   │   │
│   │   ├── tickets/              ← TASK-04 + TASK-05
│   │   │   ├── ticket.routes.js
│   │   │   ├── ticket.controller.js
│   │   │   ├── ticket.service.js
│   │   │   ├── ticket.schema.js        ← Mongoose schema (MongoDB)
│   │   │   └── ticket.validation.js
│   │   │
│   │   ├── agents/
│   │   │   ├── agent.routes.js
│   │   │   ├── agent.controller.js
│   │   │   └── agent.service.js
│   │   │
│   │   ├── otp/
│   │   │   ├── otp.routes.js
│   │   │   ├── otp.controller.js
│   │   │   ├── otp.service.js
│   │   │   └── otp.schema.js           ← Mongoose schema (MongoDB)
│   │   │
│   │   └── addons/               ← TASK-06
│   │       ├── addon.routes.js
│   │       ├── addon.controller.js
│   │       └── addon.service.js
│   │
│   ├── middlewares/
│   │   ├── authenticate.js       ← Verify JWT token
│   │   ├── authorize.js          ← Check role (OWNER / ADMIN / AGENT)
│   │   ├── workspaceGuard.js     ← TASK-03: validate workspace ACTIVE
│   │   ├── addonGuard.js         ← Validate add-on is enabled
│   │   └── errorHandler.js       ← Global error handler
│   │
│   ├── helpers/
│   │   ├── referenceCode.js      ← TASK-05: unique code generator
│   │   ├── cloudinaryUpload.js   ← TASK-06: upload helper
│   │   ├── openaiAssist.js       ← TASK-06: AI classification helper
│   │   ├── mailer.js             ← Nodemailer wrapper (OTP + notifications)
│   │   └── generateOtp.js        ← Secure numeric OTP generator
│   │
│   ├── migrations/               ← SQL migration files (ordered)
│   │   ├── 001_create_workspaces.sql
│   │   ├── 002_create_users.sql
│   │   ├── 003_create_workspace_users.sql
│   │   ├── 004_create_addons.sql
│   │   └── 005_create_invitations.sql
│   │
│   ├── seeders/
│   │   ├── seed.workspaces.js
│   │   └── seed.owner.js
│   │
│   └── app.js                    ← Express app (routes, middleware mount)
│
├── server.js                     ← Entry point (starts HTTP server)
├── .env.example                  ← Template of required env vars
├── .eslintrc.json
├── .prettierrc
├── nodemon.json
└── package.json
```text
````

---

## 6. Frontend Structure

```text
frontend/
│
├── public/
│   ├── assets/
│   │   ├── img/
│   │   │   └── logo.svg
│   │   ├── css/
│   │   │   └── output.css        ← Compiled Tailwind output
│   │   └── js/
│   │       └── utils.js          ← Shared fetch helpers / formatters
│   │
│   └── favicon.ico
│
├── src/
│   │
│   ├── pages/
│   │   ├── landing/
│   │   │   └── index.html        ← Public landing page
│   │   │
│   │   ├── owner/                ← TASK-07: Owner Global Panel
│   │   │   ├── index.html        ← Login (only @crudzaso.com)
│   │   │   ├── dashboard.html    ← Workspace list + metrics
│   │   │   └── addons.html       ← Add-on catalog management
│   │   │
│   │   ├── workspace/            ← TASK-08: Workspace Panel
│   │   │   ├── login.html        ← Email/pass + Google OAuth
│   │   │   ├── selector.html     ← Workspace selector (multi-workspace users)
│   │   │   ├── dashboard.html    ← Ticket inbox with filters
│   │   │   ├── ticket-detail.html
│   │   │   └── agents.html       ← Agent management
│   │   │
│   │   └── public/               ← TASK-10
│   │       └── track.html        ← Public ticket lookup + OTP flow
│   │
│   ├── components/
│   │   ├── navbar.html           ← Reusable nav snippet
│   │   ├── sidebar.html          ← Sidebar for admin panels
│   │   ├── ticket-card.html
│   │   └── modal-otp.html        ← OTP entry modal
│   │
│   └── widget/                   ← TASK-09: Embeddable Widget
│       ├── widget.js             ← Self-contained widget script
│       ├── widget.html           ← Dev preview of widget
│       └── widget.css            ← Scoped styles (injected by widget.js)
│
├── tailwind.config.js
└── package.json                  ← Scripts: build:css, dev, etc.
```

---

## 7. Deployment

All services are 100% free and require no credit card.

| Layer                 | Service                   | Free Tier                              |
| --------------------- | ------------------------- | -------------------------------------- |
| Backend API + Swagger | Render                    | 750 hrs/month, auto-deploy from GitHub |
| PostgreSQL            | Neon.tech                 | 0.5 GB, serverless, no credit card     |
| MongoDB               | MongoDB Atlas M0          | 512 MB, no credit card                 |
| Frontend + Widget     | Vercel                    | Unlimited static, global CDN           |
| Docusaurus Docs       | Vercel (separate project) | Same as above, clean dedicated URL     |
| Email / OTP           | Gmail SMTP + Nodemailer   | Free, no extra service needed          |
| File Storage          | Cloudinary                | 25 GB storage, 25 GB bandwidth/month   |
