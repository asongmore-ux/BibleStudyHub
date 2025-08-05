# Overview

Bible Study Hub is a full-stack web application for managing and delivering Bible study content. It features a comprehensive content management system with hierarchical organization (Mains → Classes → Lessons), user authentication, progress tracking, and an admin interface. The application supports rich text lessons with multimedia content, user bookmarks, completion tracking, and search functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript in strict mode
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system including light/dark theme support
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture  
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful API with JSON responses
- **Authentication**: Session-based authentication with user registration/login endpoints
- **File Structure**: Modular separation with routes, storage abstraction, and middleware
- **Development**: Hot reload support via Vite middleware integration
- **Build Process**: ESBuild for server bundling with ES modules

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Hierarchical content structure with foreign key relationships
- **Migration System**: Drizzle Kit for database schema management
- **Development Storage**: In-memory storage implementation for rapid prototyping
- **Production Ready**: Configured for Neon Database with connection pooling

## Database Schema
- **Users**: Authentication and profile management with admin roles
- **Mains**: Top-level content categories with ordering and icons
- **Classes**: Subcategories within mains, supporting nested hierarchies
- **Lessons**: Individual content units with rich text, multimedia, and metadata
- **User Progress**: Tracking completion status, bookmarks, and study time

## Authentication & Authorization
- **User Management**: Email-based registration and login system
- **Session Storage**: Local storage for client-side session persistence
- **Role-Based Access**: Admin users with content management privileges
- **Security**: Password handling and session validation (production-ready hooks available)

## Content Management
- **Hierarchical Organization**: Three-tier structure (Main → Class → Lesson)
- **Rich Text Editing**: Custom editor component with formatting capabilities
- **Media Support**: File upload system for images and audio content
- **Publishing Workflow**: Draft/published states for content control
- **Search Functionality**: Full-text search across lesson content with debounced queries

## UI/UX Design
- **Design System**: Shadcn/ui providing consistent component library
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Theme Support**: Light/dark mode with CSS custom properties
- **Loading States**: Skeleton components and loading indicators
- **Error Handling**: Toast notifications and error boundaries

## Development Experience
- **Type Safety**: Full TypeScript coverage with strict compiler settings
- **Code Organization**: Shared types between client and server
- **Development Tools**: Hot reload, error overlays, and development logging
- **Path Aliases**: Clean import paths with @ prefixes for better organization
- **Linting & Formatting**: Configured for consistent code style

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Drizzle ORM**: Type-safe database operations and schema management
- **Connect-pg-simple**: PostgreSQL session store for production sessions

## UI & Components
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Consistent icon library with extensive coverage
- **Embla Carousel**: Touch-friendly carousel component for content display

## Development & Build
- **Vite**: Fast build tool with development server and HMR
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **TypeScript**: Static type checking and enhanced IDE support

## Data Fetching & Validation
- **TanStack Query**: Powerful data fetching with caching and synchronization
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Performant form handling with validation integration

## Utilities & Enhancements
- **Class Variance Authority**: Type-safe CSS class composition
- **CLSX**: Conditional CSS class composition utility
- **Date-fns**: Modern date manipulation and formatting library
- **Wouter**: Lightweight routing solution for single-page applications