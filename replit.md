# School Management System

## Overview

This is a comprehensive school management system for Treasure-Home School, built as a full-stack web application. The system provides role-based dashboards for administrators, teachers, students, and parents, with features including announcements, gallery management, exam creation and taking, user management, and enrollment. The application uses a modern tech stack with React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Integration with Replit Auth using OpenID Connect

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Passport.js with OpenID Connect strategy for Replit Auth
- **API Design**: RESTful endpoints with role-based access control
- **File Structure**: Shared schema definitions between client and server

### Database Design
- **Primary Database**: PostgreSQL via Neon serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**: Users, Announcements, Gallery, Exams, Questions, Exam Submissions, Enrollments, Messages
- **Role System**: Enum-based roles (admin, teacher, student, parent) with hierarchical permissions
- **Session Storage**: Dedicated sessions table for authentication state

### Role-Based Access Control
- **Admin**: Full system access including user management, content creation, and system configuration
- **Teacher**: Exam creation, announcement posting, and student result viewing
- **Student**: Exam taking, result viewing, and announcement access
- **Parent**: Child progress monitoring and school communication access

### External Dependencies
- **Replit Auth**: OpenID Connect integration for user authentication
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Platform**: Development environment with hot reloading and runtime error handling

## External Dependencies

### Authentication Services
- **Replit Auth**: OpenID Connect provider for user authentication and session management
- **Passport.js**: Authentication middleware with OpenID Connect strategy

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Google Fonts**: Web typography (Inter font family)

### Form and Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### State Management
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing