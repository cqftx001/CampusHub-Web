# CampusHub Web

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-8-CA4245?style=flat&logo=reactrouter&logoColor=white)

CampusHub Web is the frontend for **CampusHub**, a campus marketplace platform that helps students browse, publish, and manage second-hand listings through a responsive web interface.

The application is built with **React, TypeScript, and Vite** and communicates with the CampusHub Spring Boot backend through a typed API layer.

> Backend repository: [CampusHub](https://github.com/cqftx001/CampusHub)

---

## Features

### Authentication

- User registration and login
- Email verification flow
- Protected routes for authenticated users
- Current-account lookup and logout support
- Centralized API client for authenticated requests

### Marketplace

- Browse marketplace listings
- View listing details
- Search and filter listings by keyword, category, brand, condition, and price range
- Paginated listing results
- Create new marketplace listings
- Upload listing images
- View personal listings
- Filter personal listings by status
- Change listing status

---

## Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Routing | React Router 8 |
| API Communication | Fetch-based typed API client |
| Linting | Oxlint |

---

## Project Structure

```text
src/
├── api/             # Backend API clients
│   ├── apiClient.ts
│   ├── authApi.ts
│   └── marketplaceApi.ts
├── auth/            # Authentication and route protection
├── components/      # Reusable UI components
├── features/        # Feature-oriented frontend logic
├── hooks/           # Custom React hooks
├── pages/           # Route-level pages
├── styles/          # Shared styling
├── types/           # TypeScript domain/API types
├── App.tsx          # Application routes
└── main.tsx         # Application entry point
```

---

## Application Routes

```text
/login                              Login
/signup                             Account registration
/verify-email                       Email verification
/marketplace                        Marketplace browsing
/marketplace/new                    Create listing
/marketplace/mine                   Manage personal listings
/marketplace/listings/:listingId    Listing details
```

Marketplace routes are protected and require authentication.

---

## API Integration

CampusHub Web keeps backend communication in a dedicated API layer instead of calling endpoints directly from page components.

Examples include:

```text
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
POST   /api/auth/logout
POST   /api/auth/email-verification/confirm

GET    /api/marketplace/catalog
GET    /api/marketplace/listings
GET    /api/marketplace/listings/:listingId
GET    /api/marketplace/listings/mine
POST   /api/marketplace/listings
PATCH  /api/marketplace/listings/:listingId/status
POST   /api/marketplace/images
```

Search parameters are encoded through `URLSearchParams`, while request and response payloads use TypeScript types to keep frontend-backend contracts explicit.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- CampusHub backend running locally

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print the local development URL in the terminal.

### Production build

```bash
npm run build
```

### Run lint checks

```bash
npm run lint
```

### Preview the production build

```bash
npm run preview
```

---

## Architecture

```text
                     CampusHub Web
                  React + TypeScript
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Auth UI      Marketplace UI   Shared UI
          │              │              │
          └──────────────┼──────────────┘
                         │
                    API Client
                         │
                         ▼
               CampusHub Backend
                  Spring Boot API
```

The frontend separates **route-level pages**, **reusable components**, **domain types**, and **API clients** so that UI concerns remain decoupled from backend communication logic.

---

## Roadmap

- [x] Authentication UI
- [x] Email verification
- [x] Protected routes
- [x] Marketplace browsing and filtering
- [x] Listing detail page
- [x] Listing creation
- [x] Image upload integration
- [x] Personal listing management
- [ ] Listing editing and deletion
- [ ] Campus/location-based marketplace discovery
- [ ] Order workflow
- [ ] Real-time messaging
- [ ] Payment integration
- [ ] AI marketplace assistant
- [ ] Personalized recommendation system

---

## Related Repository

The backend is maintained separately in the main CampusHub repository:

[CampusHub Backend](https://github.com/cqftx001/CampusHub)

The backend is built with Java and Spring Boot and provides authentication, marketplace APIs, persistence, Redis-backed security state, and object-storage integration.

---

## License

This project is currently under active development.
