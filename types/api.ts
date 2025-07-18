// This file contains type definitions for the API
// Using any types since we can't import from backend due to Metro config

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Simple AppRouter type for client-side usage - using any to avoid complex type issues
export type AppRouter = any;

// Type inference helpers (will be any due to AppRouter being any)
export type RouterInputs = any;
export type RouterOutputs = any;