# ICSR Cancer Patient Registry & Research Management System (CPRRMS)

CPRRMS is a centralized, secure, full-stack hospital-grade Web application built using the MERN stack (MongoDB, Express, React, Node.js) for the **ICSR Institute**. It allows medical administrators and clinicians to manage patient registrations, track oncological diagnoses and stages, record therapy regimens, upload and version medical reports, generate invoices, and view live epidemiological research analytics.

---

## 🚀 Key Features

* **JWT-Based Authentication**: Secure sign-in with short-lived Access tokens and secure, HTTP-only cookie-based Refresh tokens. Includes password recovery workflows.
* **Role-Based Access Control (RBAC)**: Distinct permissions for `Super Admin` (full access, staff onboarding, deactivations, audit log tracking) and `Admin` (clinical operations, registry updates, report uploads, receipt generation).
* **Oncology Staging & Registries**: Disease surveillance filters divided into cohorts (Breast, Lung, Blood, Oral, Liver, and Brain cancers).
* **Medical Document Versioning**: Cloudinary-backed document uploads. Traces lineage of reports recursively to maintain clinical document history. Falls back to local disk storage if Cloudinary is not configured.
* **Dynamic PDF Invoices**: Generates A4 payment receipts utilizing `PDFKit` and streams them directly into the browser.
* **Epidemiological Research Analytics**: Custom interactive dashboards containing counts and chart distributions (gender, age groups, cancer categories, stages, registration trends, treatments) using `Recharts`.
* **System Audit Trail**: Fully automated audit logging capturing the operator, timestamp, action type, IP address, and details of all modifications.

---

## 📂 Project Structure

```text
cprrms/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary SDK configuration
│   │   ├── controllers/     # REST Controllers (Auth, Patients, Analytics, etc.)
│   │   ├── middleware/      # Express authorization & error handlers
│   │   ├── models/          # Mongoose collection schemas
│   │   ├── routes/          # API endpoint routes mapping
│   │   ├── services/        # PDFKit engine & Cloudinary storage
│   │   └── utils/           # Audit trail logging, AppError, Startup seeder
│   ├── .env.example         # Template for server environment variables
│   ├── package.json
│   └── server.js            # Node entry point
└── frontend/
    ├── src/
    │   ├── assets/          # Static layout assets
    │   ├── components/      # UI icons, loaders
    │   ├── features/        # Redux Toolkit state slices
    │   ├── hooks/           # Dark mode togglers
    │   ├── layouts/         # Dashboard frames (with sidebar & notifications)
    │   ├── pages/           # Screen views (Dashboard, Profiles, Billing, Staff)
    │   ├── services/        # Axios API clients
    │   ├── App.jsx          # Client router config
    │   ├── index.css        # Tailwind core layers and variables
    │   ├── main.jsx         # App bootstrapping
    │   └── store.js         # Redux central store
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js       # Proxies API calls directly to port 5000
```

---

## 🛠️ Environment Variables Configuration

Create a `.env` file in the `backend/` directory based on the template:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cprrms?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_super_secret_access_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_at_least_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

> [!NOTE]
> If Cloudinary credentials are omitted, the backend automatically writes uploaded reports to a local `uploads/` folder. If `MONGODB_URI` is omitted, it defaults to a local MongoDB instance (`mongodb://localhost:27017/cprrms`).

---

## ⚙️ Quick Start (Local Development)

### 1. Run the Backend Server
```bash
cd backend
npm install
npm run dev
```
On startup, if the database is empty, the system automatically seeds a default **Super Admin** account:
* **Email**: `superadmin@icsr.org`
* **Password**: `Password123!`

### 2. Run the Frontend Client
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 System Verification Actions

1. **Authentication Flow Check**:
   - Sign in as `superadmin@icsr.org` with password `Password123!`.
   - Access token is saved in memory, and the refresh token is stored in a secure cookie.
2. **Onboarding Staff User**:
   - Navigate to **Staff Directory** (Super Admin exclusive).
   - Enter credentials to create a new `Admin` account.
3. **Registering Patients**:
   - Navigate to **Patients** -> **Register New Patient**.
   - Input demographic data and initial staging records. Saving generates a patient ID (e.g. `ICSR-2026-0001`).
4. **Uploading Clinical Data**:
   - Open the patient profile. Under the **Clinical Regimens** tab, click **Schedule Treatment**.
   - Under the **Medical Reports** tab, upload a report file. Click **Upload Newer Version** to check history tracking.
5. **PDF Invoicing**:
   - In the **Billing** tab, generate an invoice. Click the link icon to view/download the PDF compiled dynamically by PDFKit.
6. **Audit Logs & Settings**:
   - Go to **Settings**. Super Admins will see the live paginated list of all actions performed, alongside the Database Backup control.

---

## 🌐 Production Deployment Guide

### Backend: Render
1. Create a **Web Service** on Render.
2. Connect your Git repository.
3. Set **Runtime** to `Node`.
4. Set **Build Command** to `cd backend && npm install`.
5. Set **Start Command** to `cd backend && npm start`.
6. Under **Environment**, add the keys from your `.env` file. Ensure `NODE_ENV` is set to `production` and `FRONTEND_URL` points to your Vercel URL.

### Frontend: Vercel
1. Create a project on Vercel and connect your Git repository.
2. Configure **Root Directory** as `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Set **Build Command** to `npm run build`.
5. Set **Output Directory** to `dist`.
6. Add the environment variables:
   - Configure a proxy rewrite in a `vercel.json` file in the root if custom domains are used:
     ```json
     {
       "rewrites": [
         { "source": "/api/(.*)", "destination": "https://your-render-backend.onrender.com/api/$1" }
       ]
     }
     ```
