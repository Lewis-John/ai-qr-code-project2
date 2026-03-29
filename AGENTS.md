# AGENTS.md - AI Health Advisor Project

## Project Overview

This is a React 19 + Vite + TypeScript + Tailwind CSS health advisory application. It uses One-API integration for AI-powered personalized health reports.

## Build Commands

```bash
# Install dependencies
npm install

# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking only (no emit)
npm run lint

# Clean build artifacts
npm run clean
```

## Code Style Guidelines

### TypeScript / React

- Use explicit TypeScript types; avoid `any`
- Component files: `.tsx` extension
- Non-component utility files: `.ts` extension
- Define shared types in `src/types.ts`
- Use named exports for types and utilities
- Default export for page components only

```typescript
// Good
export interface UserHealthData { ... }
export type AppStep = 'welcome' | 'form' | 'loading' | 'report';

// Component default export
export default function App() { ... }
```

### Imports

- React imports: `import React, { useState, useEffect } from 'react';`
- Named imports for libraries: `import { motion, AnimatePresence } from 'motion/react';`
- Icons from lucide-react: named imports
- Local imports with explicit paths: `import { AppStep } from './types';`
- Sort: React → external libs → internal modules

### Naming Conventions

- Components: PascalCase (`App`, `UserForm`)
- Functions/Variables: camelCase (`generateAIReport`, `handleSubmit`)
- Types/Interfaces: PascalCase (`UserHealthData`, `AIReport`)
- CSS classes: kebab-case (Tailwind utility classes)
- Constants: SCREAMING_SNAKE_CASE if truly constant, otherwise camelCase

### React Patterns

- Use functional components with hooks
- State with `useState<T>()` - always provide type annotation for complex state
- Effects with `useEffect()` - include dependency arrays
- Event handlers: `handleXxx` prefix
- Async handlers: handle errors with try/catch, set error state for UI feedback

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const result = await generateAIReport(formData, apiConfig);
    setReport(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setErrorMsg(message);
  }
};
```

### Styling

- Use Tailwind CSS utility classes in JSX
- Custom theme colors in `src/index.css` under `@theme`
- Primary color: `#07C160` (WeChat Green)
- Avoid inline styles except for dynamic values
- Use `className` prop for all styling

### Error Handling

- API errors: catch, log, set user-friendly error state
- Use `console.error()` for debugging, remove before production
- Never expose raw error messages to users without context
- Validate form inputs with HTML5 `required` and `type` attributes

### API Integration

- One-API base URL: strip trailing slashes: `url.replace(/\/$/, '')`
- Include `Content-Type` and `Authorization` headers
- Parse JSON responses; handle potential markdown code blocks from LLM
- Fallback to mock data when API is not configured

## Architecture Notes

- Single-page application with step-based flow (welcome → form → loading → report)
- State managed with React hooks (no external state library)
- Config persisted to localStorage
- Motion animations via `motion/react` library
- Lucide React for icons

## File Structure

```
src/
  main.tsx       - Entry point
  App.tsx        - Main component (all logic)
  types.ts       - TypeScript interfaces
  index.css      - Global styles, Tailwind config
```
