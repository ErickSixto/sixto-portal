# Test Credentials

## Admin User
- **Email:** sixto.developer@gmail.com
- **Role:** admin
- **Auth Method:** Magic Link (mock - code displayed on screen)

## Auth Flow
1. Go to /login
2. Enter email
3. Click "Continue"
4. Copy the 6-digit code from "Demo Mode" display
5. Paste code and click "Sign In"

## Auth Endpoints
- POST /api/auth/request-magic-link - body: {"email": "..."}
- POST /api/auth/verify-magic-link - body: {"email": "...", "code": "..."}
- GET /api/auth/me - requires auth
- POST /api/auth/logout

## Notes
- Magic links are MOCKED (code shown in UI, no email sent)
- JWT tokens stored in httpOnly cookies + Authorization Bearer header
- Notion API key not yet configured (data will be empty)
