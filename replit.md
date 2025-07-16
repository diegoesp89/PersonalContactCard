# Contact Card Application

## Overview

This is a modern digital contact card application built as a full-stack web application. It allows users to display and share their contact information in a professional, visually appealing format with the ability to export contact details as vCard files.

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

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Storage**: In-memory storage with interface for easy database migration
- **Session Management**: Ready for PostgreSQL session storage integration

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Simple contact information table with personal and banking details
- **Migration**: Drizzle Kit for database migrations and schema management

## Key Components

### Data Models
- **Contact**: Core entity containing personal information (name, title, phone, email, social media, banking details)
- **User**: Authentication-ready user entity (currently unused but prepared for future auth)

### API Endpoints
- `GET /api/contact` - Retrieve contact information
- `PUT /api/contact` - Update contact information with validation
- `GET /api/contact/vcard` - Generate and download vCard file

### Frontend Features
- **Contact Display**: Professional card layout with contact information
- **Social Media Integration**: Direct links to WhatsApp, Instagram, and personal website
- **Banking Information**: Secure display of banking details for payments
- **vCard Export**: One-click download of contact information in standard vCard format
- **Responsive Design**: Mobile-first approach with dark theme

## Data Flow

1. **Initial Load**: React Query fetches contact data from `/api/contact` endpoint
2. **Display**: Contact information is rendered in a card-based layout
3. **Interactions**: Users can click to call, email, message on WhatsApp, or visit social media
4. **Export**: vCard generation creates downloadable contact file
5. **Updates**: Future admin interface will use PUT endpoint to modify contact information

## External Dependencies

### Frontend Libraries
- React ecosystem (React, React DOM, React Query)
- UI libraries (Radix UI components, Lucide React icons)
- Styling utilities (Tailwind CSS, class-variance-authority, clsx)
- Form handling (React Hook Form with Zod validation)
- Date utilities (date-fns)

### Backend Libraries
- Express.js framework with TypeScript support
- Drizzle ORM with PostgreSQL adapter
- Neon Database serverless driver
- Session management with connect-pg-simple
- Development tools (tsx, esbuild)

### Development Tools
- Vite for frontend development and building
- TypeScript for type safety
- PostCSS with Autoprefixer
- ESLint configuration ready
- Replit-specific development enhancements

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema updates

### Environment Configuration
- **Development**: Uses tsx for hot reloading and Vite dev server
- **Production**: Serves static files and API from single Express server
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Deployment Requirements
- Node.js environment with ES module support
- PostgreSQL database (Neon Database recommended)
- Environment variables for database connection
- Static file serving capability for built frontend assets

### Architecture Benefits
- **Monorepo Structure**: Shared types and schemas between frontend and backend
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Scalability**: Ready for database migration from memory storage
- **Modern Stack**: Uses latest web development practices and tools
- **Professional UI**: Enterprise-grade component library with accessibility support