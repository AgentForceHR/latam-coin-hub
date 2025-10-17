# SolDeFi Setup Guide

## Overview
Complete implementation of SolDeFi landing page and application with backend API, frontend pages, and database integration.

## What Was Created

### Database Tables (Supabase)
1. **landing_content** - Multilingual content for landing page (en/es/pt)
2. **app_transactions** - Track SDF token purchases
3. **users** (updated) - Added kyc_status, sdf_balance, vesting_start

### Backend API Endpoints

#### Landing Page (`/api/landing/`)
- `GET /info?lang={en|es|pt}` - Get landing page content
- `GET /languages` - List available languages
- `GET /redirect` - Redirect to app.soldefi.latam

#### App (`/api/app/`)
- `GET /price?lang={en|es|pt}` - Get current LBP price
- `POST /buy` - Purchase SDF tokens (requires JWT auth)
- `GET /dashboard` - Get user dashboard data (requires JWT auth)

### Frontend Pages

#### Routes
- `/soldefi` - Landing page
- `/soldefi/app` - Application page

## Troubleshooting 404 Errors

If you're getting 404 errors for `/soldefi` routes, try these steps:

### Option 1: Restart Dev Server
The dev server needs to restart to pick up new route changes:
1. Stop the current dev server (Ctrl+C)
2. Run `npm run dev` again
3. Navigate to `http://localhost:5173/soldefi`

### Option 2: Clear Build Cache
```bash
rm -rf dist/ node_modules/.vite
npm run dev
```

### Option 3: Verify Route Registration
Check that `src/App.tsx` contains:
```tsx
<Route path="/soldefi" element={<SolDeFiLanding />} />
<Route path="/soldefi/app" element={<SolDeFiApp />} />
```

### Option 4: Hard Refresh Browser
- Chrome/Firefox: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear browser cache if needed

## Features

### Landing Page (`/soldefi`)
- Sun-themed design (yellow #FFC107, black, blue)
- Language switcher (en/es/pt)
- Hero section with headline and CTA
- Mission statement
- Launch timeline (Fair Launch + LBP)
- Responsive mobile-first design

### App Page (`/soldefi/app`)
- Three tabs: Home, Buy, Dashboard
- Real-time LBP price display
- Token purchase interface with KYC validation
- User dashboard with balance and vesting info
- Transaction history
- Language switcher

## API Testing

Use the Postman collection: `server/SolDeFi_API.postman_collection.json`

Import into Postman and set:
- `base_url`: `http://localhost:3001`
- `auth_token`: (get from login/register)

## Running the Backend

```bash
cd server
npm run dev
```

The backend runs on port 3001 by default.

## Environment Variables

Backend requires (in `server/.env`):
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

## Deployment Checklist

- [x] Database migrations applied
- [x] Backend API endpoints created
- [x] Frontend pages created
- [x] Routes registered in App.tsx
- [x] Postman collection exported
- [x] Build succeeded
- [ ] Dev server restarted
- [ ] Pages accessible at /soldefi and /soldefi/app

## Next Steps

1. Restart your dev server
2. Navigate to http://localhost:5173/soldefi
3. Test language switching
4. Click "Join App" to navigate to /soldefi/app
5. Test the app functionality (requires backend running)
