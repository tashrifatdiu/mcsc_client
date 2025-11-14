# Milestone College Science Club - Client

This is a minimal React frontend for the registration flow.

Environment
- Optionally set REACT_APP_API_BASE to point to the server (default: http://localhost:5000).

Run
1. cd client
2. npm install
3. npm start
4. Open http://localhost:3000

Pages
- /registration-request : submit registration (POST /api/registration)
- /admin-verify : list registrations and approve (GET /api/registration, PATCH /api/registration/:id/approve)

Note: This is a minimal UI for demonstration. No authentication is implemented.