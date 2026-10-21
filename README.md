# API Manager

A complete, professional, and secure full-stack API Management platform built from scratch using the **MERN** stack (MongoDB, Express.js, React.js, Node.js).

**API Manager** provides a unified control plane for administrators to govern APIs, provision secure cryptographic keys, configure sliding-window rate limits, and monitor real-time health telemetry. Developers enjoy a self-service workspace to discover authorized endpoints, generate scoped API keys, execute requests interactively in the **API Tester**, and track their consumption history.

Designed to be presented and demonstrated to a lecturer in **3 to 5 minutes**.

---

## 🚀 Key Features

### 👑 Administrator Portal
- **Admin Dashboard**: Real-time summary cards (*Total Requests*, *Successful Requests*, *Failed Requests*, *Rate-Limited Requests*, *Average Response Time*), API Health status list, and recent system alerts.
- **API Management**: Register new endpoints, configure methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), toggle active/inactive status, execute live health checks, and edit endpoint metadata.
- **API Keys**: Provision cryptographically secure SHA-256 hashed API keys (`apm_live_...`), view keys in masked form (`apm_live_...1a2b`), activate/deactivate, and permanently revoke keys.
- **Rate Limits**: Configure per-API request quotas over custom sliding windows (e.g., 5 requests per 60s). Visual progress bars display real-time percentage usage with automatic warnings (≥80%) and hard limits (100% -> HTTP 429).
- **Request Logs**: Complete real-time audit log with Timestamp, API Name, Method, Status Code, Latency (ms), Result, and Caller identity with multi-factor filtering.
- **Notifications**: Automated event-driven alerts for rate limit warnings, quota breaches, latency spikes, and key lifecycle updates.
- **Platform Analytics**: Mandatory visual telemetry with:
  1. **Graph 1: API Requests — Last 7 Days** (Daily request volume line graph)
  2. **Graph 2: Request Status** (Successful vs. Failed vs. Rate-Limited distribution)
  3. **Graph 3: Average Response Time** (Chronological latency trend over time)

### 💻 Developer Portal
- **Developer Dashboard**: Personal consumption stats (*My Requests*, *Active API Keys*, *Available APIs*, *Successful Requests*) and personal 7-day traffic chart.
- **Available APIs**: Catalog of active published endpoints with method badges, descriptions, and quick-launch test actions.
- **My API Keys**: Self-service API key generation, masked key visualization, copy utilities, and status inspection.
- **Interactive API Tester**: Send live requests with method selection, custom query params, headers, and JSON request bodies. Displays real HTTP status codes, latency in milliseconds, response headers, and formatted JSON payloads.
- **Developer Usage Analytics**: Personal 7-day request trends and status breakdown charts.
- **Request History**: Complete personal audit trail of all calls executed using the developer's scoped keys.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Database** | MongoDB (via Mongoose ODM) |
| **Backend** | Node.js & Express.js REST API |
| **Frontend** | React.js (Vite) |
| **Styling** | Modern Vanilla CSS Design System with dark-mode aesthetic and CSS tokens |
| **Graphs & Charts** | Recharts (Responsive Line & Bar Charts) |
| **Icons** | Lucide React |
| **Security** | JWT Authentication, bcryptjs password hashing, SHA-256 API key hashing |

---

## 📂 Project Structure

```text
API Manager/
├── backend/
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── apiController.js
│   │   ├── apiKeyController.js
│   │   ├── authController.js
│   │   ├── gatewayController.js
│   │   ├── logController.js
│   │   ├── notificationController.js
│   │   └── rateLimitController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Api.js
│   │   ├── ApiKey.js
│   │   ├── Notification.js
│   │   ├── RequestLog.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── apiKeyRoutes.js
│   │   ├── apiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── gatewayRoutes.js
│   │   ├── logRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── rateLimitRoutes.js
│   ├── utils/
│   │   └── keyGenerator.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── AnalyticsPage.jsx
│   │   │   │   ├── ApiKeysPage.jsx
│   │   │   │   ├── ApiManagement.jsx
│   │   │   │   ├── NotificationsPage.jsx
│   │   │   │   ├── RateLimitsPage.jsx
│   │   │   │   └── RequestLogsPage.jsx
│   │   │   ├── developer/
│   │   │   │   ├── AvailableApisPage.jsx
│   │   │   │   ├── DeveloperAnalyticsPage.jsx
│   │   │   │   ├── DeveloperDashboard.jsx
│   │   │   │   ├── DeveloperLayout.jsx
│   │   │   │   ├── MyApiKeysPage.jsx
│   │   │   │   └── RequestHistoryPage.jsx
│   │   │   └── OpeningPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on port 27017 (or MongoDB Atlas connection URI)

### 2. Backend Setup
1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (a default `.env` is provided):
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/api_manager
   JWT_SECRET=super_secret_api_manager_jwt_key_2026
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will start listening on `http://localhost:5000` and automatically connect to MongoDB.*

### 3. Frontend Setup
1. Open another terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 🎯 3–5 Minute Lecturer Demonstration Guide

Follow this streamlined script to demonstrate the full application:

### Step 1: Opening Page & Authentication (30 seconds)
1. Open `http://localhost:5173`. Point out the title **API Manager**.
2. Demonstrate the role tabs: **Admin Login** and **Developer Login**.
3. Register or log into an Admin account (e.g. `admin@apimanager.com`).
4. Highlight that no hardcoded or fake demo credentials appear anywhere in the interface.

### Step 2: Register API & Configure Rate Limit (1 minute)
1. Go to **API Management** in the sidebar. Click **Register New API**.
2. Register an API:
   - **Name**: `User Profile Service`
   - **Method**: `GET`
   - **Endpoint**: `/api/v1/users`
   - **Rate Limit**: `3` requests per `60` seconds.
3. Click **Register API**. Show the live record in the table.
4. Click the **Health Check** icon to run an immediate live latency check (status shows **Healthy**).
5. Switch to **Rate Limits** to verify the quota of `3 req/60s` is active with `0%` usage.

### Step 3: Developer Portal & Interactive API Tester (1.5 minutes)
1. Log out and switch to **Developer Login** (e.g. `dev@company.com`).
2. Show **Available APIs** where `User Profile Service` is listed.
3. Navigate to **My API Keys**, click **Generate API Key**, and copy the newly generated key.
4. Go to **API Tester**:
   - Select `User Profile Service`.
   - Paste the authorized API key into the `x-api-key` field.
   - Click **Send Request**. Point out the **HTTP 200 OK**, actual latency in milliseconds, and the formatted JSON response.
   - Rapidly click **Send Request** 3 more times.
   - Show how the gateway dynamically enforces the configured quota and returns **HTTP 429 Too Many Requests** with an explanation message!
5. Navigate to **Request History** and **Usage Analytics** to show the developer's personal real-time audit logs and 7-day request graph.

### Step 4: Admin Governance, Notifications & Graphs (1 minute)
1. Log out and log back in as **Admin**.
2. Navigate to **Notifications**: show the automated alerts generated by the system (*Rate Limit Warning* and *Rate Limit Exceeded*).
3. Navigate to **Request Logs**: show the platform-wide audit trail with both `200` and `429` status codes.
4. Navigate to **Analytics**: showcase all 3 mandatory graphs populated with actual request data:
   - **Graph 1: API Requests — Last 7 Days** (Actual request counts plotted per day)
   - **Graph 2: Request Status** (Bar chart breaking down Successful and Rate-Limited requests)
   - **Graph 3: Average Response Time** (Line graph tracking response latency over time)

---

## 🔒 Security Best Practices Implemented
- Passwords hashed using `bcryptjs` with salt rounds.
- Cryptographically secure API keys generated via Node's `crypto.randomBytes` and stored as SHA-256 hashes.
- Keys are displayed only in masked format (`apm_live_...4 chars`) to prevent leakage.
- Strict Role-Based Access Control (RBAC) enforced on backend Express routes.
- Rate limits enforced on the backend via a sliding window; client limits cannot be bypassed.
- No database identifiers (`_id`) exposed as public URLs; endpoints use clean REST paths and slugs.

---

## 📄 License
This project is developed for educational and demonstration purposes.
