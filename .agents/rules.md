# API Manager — Project Rules

## 1. Project Overview

Build a simple, professional, and fully working API management platform named **API Manager**.

The application must allow administrators to manage APIs and developers to access and test available APIs.

The project must be easy to understand, demonstrate, and explain to a lecturer.

## 2. Technology Stack

- Frontend: React.js
- Backend: Node.js and Express.js
- Database: MongoDB
- Graphs: Use a suitable chart library compatible with React.
- API communication: REST APIs

Use the MERN stack throughout the project.

## 3. User Roles

The application must have only two user roles:

### Admin
- Manage registered APIs.
- Create, activate, deactivate, and revoke API keys.
- Configure API rate limits.
- Monitor API health and request activity.
- View request logs.
- Receive notifications.
- View analytics and graphs.

### Developer
- View available APIs.
- Access authorized API keys.
- Test APIs using the API Tester.
- View personal request history.
- View personal usage analytics.

**Do not implement a Super Admin role or Super Admin login.**

Enforce role permissions in both the frontend and backend.

## 4. Opening Page and Login

- Display the project title as **API Manager** everywhere.
- The opening page must contain Admin Login and Developer Login options.
- Allow users to switch between these two login pages.
- Do not display example usernames, passwords, demo credentials, or example IDs.
- Implement proper authentication.
- Redirect users to the correct dashboard based on their role.
- Prevent unauthorized access to protected pages.

## 5. UI and Design Rules

- Keep the interface clean, modern, and professional.
- Use simple English for all labels and messages.
- Keep navigation consistent across pages.
- Use readable fonts, proper spacing, and clear headings.
- Use consistent buttons, forms, tables, and status indicators.
- Avoid unnecessary animations, complicated layouts, and excessive dashboard cards.
- Make the application responsive on desktop, tablet, and mobile.
- Do not add unnecessary pages or features.

## 6. Admin Navigation

Use the following sidebar:

1. Dashboard
2. API Management
3. API Keys
4. Rate Limits
5. Request Logs
6. Notifications
7. Analytics

Keep the sidebar simple and consistent.

## 7. Developer Navigation

Use the following sidebar:

1. Dashboard
2. Available APIs
3. My API Keys
4. API Tester
5. Usage Analytics
6. Request History

Developers must only see data and APIs they are authorized to access.

## 8. Dashboard Rules

The Admin Dashboard must display:

- Total Requests
- Successful Requests
- Failed Requests
- Rate-Limited Requests
- Average Response Time
- API Health

The Developer Dashboard must display:

- My Requests
- Active API Keys
- Available APIs
- Successful Requests

Use actual database and backend data. Do not hardcode statistics as real results.

## 9. Graphs Are Mandatory

Graphs must be included on the Admin Dashboard and Analytics page.

### Required Graph 1: API Requests — Last 7 Days
- Use a line graph.
- X-axis: Day.
- Y-axis: Number of Requests.
- Display actual daily request counts.

### Required Graph 2: Request Status
- Use a bar chart or doughnut chart.
- Show successful, failed, and rate-limited requests.

### Required Graph 3: Average Response Time
- Use a line graph.
- Show actual response times over time.
- Place it on the Analytics page or Dashboard.

### Graph Rules
- Use actual data from the backend.
- Update graphs when new requests are recorded.
- Include clear titles, labels, and tooltips.
- Keep graphs readable and simple.
- Do not remove required graphs.
- Never use random numbers or fake data.
- If no data is available, show an empty-state message while keeping the graph layout visible.

## 10. API Management Rules

Admin must be able to:

- Register APIs.
- View registered APIs.
- Edit API details.
- Enable or disable APIs.
- View API endpoints and methods.
- View request usage and response times.
- View API health.

Validate all API information before saving it.

Display useful information such as API name, endpoint, method, status, request count, response time, and rate limit.

## 11. API Key Rules

- Generate secure API keys.
- Associate each key with the correct API and authorized user.
- Display keys in masked form after creation.
- Allow authorized activation, deactivation, and revocation.
- Validate keys on the backend.
- Never store secret keys in plain text.
- Never expose complete secret keys unnecessarily.
- Do not allow developers to access another developer's keys.
- Do not create fake API keys or example key records.

## 12. Rate Limiting Rules

- Allow Admin to configure request limits.
- Track actual request usage.
- Show the current usage and configured limit.
- Display warnings when an API approaches its limit.
- Block requests that exceed the configured limit.
- Return HTTP `429 Too Many Requests` when appropriate.
- Record rate-limited requests in the logs.
- Enforce limits on the backend, not only in the frontend.

## 13. API Health Rules

Use three simple statuses:

- Green: Healthy
- Yellow: Warning
- Red: Critical

Determine API health from real health checks and available monitoring data.

Use request failures, response time, availability, and rate-limit usage where appropriate.

Do not mark every API as healthy by default.

If an API is unavailable, display a clear status and message.

## 14. Request Logging Rules

Record actual API requests where applicable.

Each log should include:

- Timestamp
- API
- Request Method
- HTTP Status Code
- Response Time
- Result

Distinguish successful, failed, and rate-limited requests.

Provide simple filtering where practical.

Do not display invented request logs.

## 15. Notification Rules

Generate notifications from actual system events, including:

- API approaching its request limit.
- API exceeding its request limit.
- Increased request failures.
- High response time.
- API unavailable.
- API key issued or revoked.

Do not generate fake notifications to populate the interface.

Show a clear message when no notifications are available.

## 16. API Tester Rules

The API Tester must allow developers to:

1. Select an authorized API.
2. Enter the required request information.
3. Select a supported request method.
4. Provide an authorized API key.
5. Send the request.
6. View the actual response.

Display the actual HTTP status code, response time, and response data.

Do not display a hardcoded success response when a request fails.

Handle invalid requests, authentication failures, and server errors clearly.

## 17. Analytics Rules

Display actual request statistics and graphs.

Include:

- Total Requests
- Successful Requests
- Failed Requests
- Rate-Limited Requests
- Average Response Time
- Request Traffic Graph
- Request Status Graph
- Response Time Graph

Developers must only see their own analytics. Admins may view platform-wide analytics within the application's intended scope.

## 18. No Fake Data or Example IDs

Never display fake records as real information.

Do not include:

- Example user IDs.
- Example organization IDs.
- Demo credentials.
- Fake API keys.
- Fake request IDs.
- Invented API records.
- Random graph values.
- Fake notifications.
- Hardcoded request statistics.
- Placeholder records.

Do not expose internal database identifiers in the interface unless required for a genuine user-facing purpose.

Internal database IDs may still be used by the backend.

When the database is empty, show a helpful message and allow users to create real records.

Do not delete legitimate user data.

## 19. Security Rules

- Hash passwords using a secure password-hashing method.
- Protect sensitive routes.
- Validate input on the backend.
- Implement role-based access control.
- Validate API keys securely.
- Protect secrets using environment variables.
- Configure appropriate CORS rules.
- Handle errors without exposing secrets or stack traces.
- Never commit `.env` files or real credentials.
- Ensure users cannot access data belonging to unauthorized users.

## 20. Code Quality Rules

- Use a clear and organized folder structure.
- Keep frontend and backend code separate.
- Use reusable React components.
- Keep API routes, database models, controllers, and middleware organized.
- Use meaningful variable and function names.
- Avoid unnecessary duplicate code.
- Validate inputs and handle errors.
- Keep configuration and secrets outside source code.
- Include a `.env.example` file with variable names but no real credentials.
- Document how to install dependencies, configure MongoDB, and run the application.

## 21. Testing Rules

Test the following before considering the project complete:

- Admin login and permissions.
- Developer login and permissions.
- Switching between login pages.
- API registration and editing.
- API activation and deactivation.
- API key creation and revocation.
- API key validation.
- Rate-limit enforcement.
- Request logging.
- Notification generation.
- All required graphs.
- API Tester requests and responses.
- Developer-specific usage analytics.
- Protected routes and unauthorized access.
- Empty database states.
- Responsive layout.
- Broken links and major console errors.

Do not claim a feature is working unless it has been tested.

## 22. Final Project Goal

The application must clearly demonstrate this workflow:

**Admin:** Login → Register API → Issue API Key → Configure Rate Limit → Monitor API → Receive Notifications → View Logs and Graphs.

**Developer:** Login → View Available APIs → Access Authorized API Key → Test API → View Response → View Usage.

Prioritize correctness, security, simplicity, and clear graphs over adding more features.

The final application must be titled **API Manager** everywhere and must be simple enough to explain in a 3–5 minute presentation.