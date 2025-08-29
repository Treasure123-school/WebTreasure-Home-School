import express, { type Request, Response, NextFunction } from "express";
import cors from "cors"; // ✅ ADD CORS IMPORT
import { registerRoutes } from "./routes";

const app = express();

// ✅ ADD CORS MIDDLEWARE - Configure for Vercel frontend + local development
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app', // ✅ Replace with your actual Vercel domain
    'http://localhost:3000',              // ✅ Local development
    'http://localhost:5173'               // ✅ Vite dev server
  ],
  credentials: true,                      // ✅ Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // ✅ Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization']     // ✅ Allowed headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// ✅ ADD HEALTH CHECK ENDPOINT
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err); // ✅ Add error logging
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Handle 404 routes
  app.use('*', (_req: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Serve static files in production
  if (app.get("env") === "production") {
    app.use(express.static('../client/dist'));
  }

  const port = parseInt(process.env.PORT || '10000', 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌐 Health check: http://localhost:${port}/health`);
  });
})();
