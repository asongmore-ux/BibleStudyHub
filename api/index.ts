import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create the Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes once
let routesInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only initialize routes once
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }

  // Handle the request
  app(req as any, res as any);
}