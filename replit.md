# LumaSpace

## Overview
LumaSpace is a Next.js web application built with React 18 and TypeScript. It features a dark-themed UI with Radix UI components and Tailwind CSS styling.

## Project Architecture
- **Framework**: Next.js 13.x with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with tailwindcss-animate
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Project Structure
```
app/           # Next.js app router pages and layouts
components/    # React components (UI primitives and custom)
config/        # Site configuration
hooks/         # Custom React hooks
lib/           # Utility functions and shared code
public/        # Static assets
styles/        # Global CSS styles
types/         # TypeScript type definitions
```

## Development
- **Dev Server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Start Production**: `npm run start`
- **Lint**: `npm run lint`
- **Type Check**: `npm run typecheck`

## Deployment
Configured for autoscale deployment on Replit:
- Build command: `npm run build`
- Start command: `npm run start`

## Recent Changes
- 2026-02-04: Configured for Replit environment (port 5000, 0.0.0.0 binding)
