# 🛒 All-In-One Store | Multi-Vendor E-Commerce Architecture

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

A robust, highly scalable multi-vendor e-commerce platform built with a modern React frontend and a Node.js/Express backend, optimized for **Serverless Deployment** on Vercel. 

This monolithic repository is engineered to handle multiple vendor storefronts, comprehensive admin oversight, and a seamless customer shopping experience, utilizing advanced state management and secure authentication protocols.

## ✨ Core Features & Architecture

### 🔐 Role-Based Access Control (RBAC)
* **Super Admin:** Global dashboard for vendor onboarding (activation code generation), ad approval, and platform-wide order monitoring.
* **Vendor (Multi-Tenant):** Isolated storefront management, inventory tracking, working hours configuration, and localized order fulfillment.
* **Customer:** Intelligent cart management, localized checkout logic, and secure order history.

### ⚡ Performance & Optimization
* **Serverless Compatibility:** The Express API is adapted for Vercel Serverless Functions.
* **Prisma Singleton Pattern:** Implemented a global Prisma client instance to prevent database connection exhaustion in serverless environments.
* **Debounced Live Search:** Optimized API calls during real-time product search to minimize database load and enhance UX.

### 💳 Localized Payment Integration
* Dynamic checkout workflows supporting Cash on Delivery (COD), Syriatel Cash, MTN Cash, and ChamCash (with integrated QR code rendering and one-click wallet ID copying).

### 🎨 Modern UI/UX
* Fully responsive design utilizing Tailwind CSS.
* Native Dark/Light mode switching.
* Context-driven localization (English/Arabic RTL support).

## 🛠️ Tech Stack

* **Frontend:** React.js 18, Vite, Tailwind CSS, React Router DOM, Context API.
* **Backend:** Node.js, Express.js (Serverless architecture).
* **Database & ORM:** PostgreSQL (hosted on Neon), Prisma ORM.
* **Security & Auth:** JSON Web Tokens (JWT), Bcrypt.js password hashing.

## 🚀 Local Development Setup

### Prerequisites
Ensure you have Node.js (v18+) and npm installed. You will also need a PostgreSQL database instance.

### Installation

 Clone the repository:
bash
git clone [https://github.com/abdalrahmanbarnbo-ui/All-In-One-Store.git](https://github.com/abdalrahmanbarnbo-ui/All-In-One-Store.git)
cd All-In-One-Store

Install dependencies:

Bash
npm install
Environment Configuration:
Create a .env file in the root directory and configure the following variables:

مقتطف الرمز
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your_highly_secure_jwt_secret_key"
Database Initialization:
Generate the Prisma client and push the schema to your database:

Bash
npx prisma generate
npx prisma db push
Start the Development Server:

Bash
npm run dev
The application will be running concurrently (Frontend + API) on http://localhost:5173.

☁️ Deployment (Vercel)
This project is configured for seamless deployment on Vercel. The vercel.json file handles the routing, ensuring API requests are routed to the serverless Node.js functions while serving the built Vite static assets.

Ensure postinstall: "prisma generate" is in your package.json scripts.

Add DATABASE_URL and JWT_SECRET to your Vercel Environment Variables before deploying.

Engineered by ENG. AbdAlrahman Barnbo


Once you commit this, your repository will immediately look like it belongs to an experienced, senior-level software engineer. 

Are you ready to head over to Vercel and officially launch the store? Let me know if you need the Vercel deployment steps again!
