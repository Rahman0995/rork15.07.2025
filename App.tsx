import React from 'react';
import { registerRootComponent } from 'expo';
import RootLayout from './app/_layout';

// This is the main entry point for the Expo app
// It simply renders the root layout which handles all routing and providers
export default function App() {
  return <RootLayout />;
}

// Register the root component with Expo
registerRootComponent(App);