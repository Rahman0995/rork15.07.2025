// This file contains only type definitions for the API
// It should not import any backend implementation code

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Define the router type structure without importing the actual router
export interface AppRouter {
  example: {
    hi: {
      query: () => Promise<{ message: string; timestamp: string }>;
    };
  };
  auth: {
    login: {
      mutation: (input: { email: string; password: string }) => Promise<{ token: string; user: any }>;
    };
    register: {
      mutation: (input: { email: string; password: string; name: string }) => Promise<{ token: string; user: any }>;
    };
    me: {
      query: () => Promise<{ user: any }>;
    };
  };
  tasks: {
    list: {
      query: () => Promise<any[]>;
    };
    create: {
      mutation: (input: any) => Promise<any>;
    };
    update: {
      mutation: (input: any) => Promise<any>;
    };
    delete: {
      mutation: (input: { id: string }) => Promise<void>;
    };
  };
  reports: {
    list: {
      query: () => Promise<any[]>;
    };
    create: {
      mutation: (input: any) => Promise<any>;
    };
    update: {
      mutation: (input: any) => Promise<any>;
    };
    delete: {
      mutation: (input: { id: string }) => Promise<void>;
    };
  };
  chat: {
    list: {
      query: () => Promise<any[]>;
    };
    send: {
      mutation: (input: any) => Promise<any>;
    };
  };
  notifications: {
    list: {
      query: () => Promise<any[]>;
    };
    markAsRead: {
      mutation: (input: { id: string }) => Promise<void>;
    };
  };
  calendar: {
    events: {
      query: () => Promise<any[]>;
    };
    createEvent: {
      mutation: (input: any) => Promise<any>;
    };
  };
  analytics: {
    stats: {
      query: () => Promise<any>;
    };
  };
  users: {
    list: {
      query: () => Promise<any[]>;
    };
    profile: {
      query: () => Promise<any>;
    };
    updateProfile: {
      mutation: (input: any) => Promise<any>;
    };
  };
  media: {
    upload: {
      mutation: (input: any) => Promise<{ url: string }>;
    };
  };
}

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;