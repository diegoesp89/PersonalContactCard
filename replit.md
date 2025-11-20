# Contact Card Application

## Overview
This project is a modern digital contact card application, designed as a full-stack web application. It enables users to professionally display and share their contact information, including the ability to export details as vCard files. The business vision is to provide a versatile and visually appealing platform for personal and professional networking, with market potential in various industries requiring efficient contact sharing. The project aims to offer robust features such as multi-language support, comprehensive analytics, advanced image handling, and a flexible architecture for future expansions like a restaurant menu demo.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with a dark theme design system
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **UI/UX Decisions**: Professional card layout, responsive design (mobile-first), interactive elements like 3D parallax effects on images, skeleton loaders, and a comprehensive image editor with zoom and cropping. Features multi-link support for social media and basic contact information, personalized background colors, and a cover image similar to social media profiles.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Storage**: PostgreSQL database with Drizzle ORM
- **Authentication**: Two-level authentication (SuperAdmin and basic Admin) with distinct permissions, including an `inDev` status for contacts visible only to SuperAdmin.
- **Analytics System**: Tracks page views and clicks on links, accessible via a dedicated statistics page with password protection.
- **Logging System**: Detailed logging of operations (views, CRUD actions, image uploads/deletions) with a web interface.
- **Image Storage**: Primary storage via Replit Object Storage, with local file system as a fallback for robustness. Includes image gallery management with upload/delete functionality and automatic backups.

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL.
- **Schema**: Stores contact information, personal details, banking information, multiple social media links, multiple contact details (phone, email, WhatsApp, website), profile images, cover images, analytics data, and creation timestamps.
- **Migration**: Drizzle Kit for database migrations, ensuring schema updates for new features like multi-link fields, cover images, and creation date tracking.
- **Creation Date Tracking**: Each contact includes a `createdAt` timestamp field that records when the contact was created, visible in both the editor and statistics pages.

### Key Features Implemented:
- Dynamic contact routes and QR code generation for direct access and sharing.
- Multi-language support (Spanish, Portuguese, English) with per-contact default language setting.
- Advanced image management including profile pictures, cover images, an image gallery, and an integrated image editor.
- Automated vCard generation with all contact fields.
- Conditional display of contact information (e.g., WhatsApp only if data exists).
- Real-time search and alphabetical sorting in the admin panel.
- Robust error handling and caching for image serving from Object Storage.
- Integrated system contact details (WhatsApp, phone, email, Instagram) in a footer modal with EULA (Terms and Conditions) in three languages.
- Special features like a "DEMO" ribbon for `inDev` contacts and a dedicated `/menu-demo` page with an Arabic theme.
- Automatic redirection from old Replit URLs to `cashirts.cl`.
- **Extended Profile**: Password-protected linking between contacts. Contacts can have an "Extended Profile" button that requires password verification before redirecting to another contact's profile. Password validation is server-side only for security.
- **Google Maps Integration**: Interactive map display for office addresses using Google Maps Embed API with secure environment variable configuration.

## External Dependencies

### Frontend Libraries
- React ecosystem (React, React DOM, React Query)
- UI libraries (Radix UI components, Lucide React icons, shadcn/ui)
- Styling utilities (Tailwind CSS, class-variance-authority, clsx)
- Form handling (React Hook Form with Zod validation)
- Date utilities (date-fns)

### Backend Libraries
- Express.js framework
- Drizzle ORM with PostgreSQL adapter (Neon Database serverless driver)
- connect-pg-simple for session management (prepared)
- tsx, esbuild for development tooling

### External Services / APIs
- Replit Object Storage: For persistent image storage and serving.
- PostgreSQL database: For primary data storage.
- QR code generation (internal API endpoint).
- Google Maps Embed API: For displaying interactive location maps (requires VITE_GOOGLE_MAPS_API_KEY).

## Recent Changes
- **2025-11-20**: Integrated Google Maps Embed API to display interactive maps when contacts have office addresses configured. Implemented secure environment variable handling with `.gitignore` protection and runtime fallback for missing API keys.
- **2025-11-20**: Added comprehensive EULA (End User License Agreement - Terms and Conditions) to the system contact modal with automatic language switching between Spanish, English, and Portuguese based on user's selected language.
- **2025-10-10**: Added creation date tracking (`createdAt`) to all contacts. This field is automatically set when a contact is created and is displayed in both the contact editor and statistics pages. Existing contacts were assigned today's date.
- **2025-10-10**: Implemented Extended Profile feature allowing password-protected contact linking. Contacts can link to another contact's profile via a password-protected button. Includes security fix to prevent password exposure (passwords excluded from API responses, validation server-side only).