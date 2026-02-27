import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { spawn, type ChildProcess } from "child_process";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

const FOUNDRY_PORT = 30000;
const FOUNDRY_ROUTE_PREFIX = "foundry";
const FOUNDRY_DIR = path.resolve("FoundryVTT-Node-13.351");
const FOUNDRY_USERDATA = path.resolve("FoundryVTT-userdata");

let foundryProcess: ChildProcess | null = null;

function startFoundryVTT(): Promise<void> {
  return new Promise((resolve) => {
    console.log("[FoundryVTT] Starting server...");

    foundryProcess = spawn(
      "node",
      [
        "main.js",
        `--port=${FOUNDRY_PORT}`,
        `--routePrefix=${FOUNDRY_ROUTE_PREFIX}`,
        `--dataPath=${FOUNDRY_USERDATA}`,
        "--noupnp",
      ],
      {
        cwd: FOUNDRY_DIR,
        env: { ...process.env, NODE_ENV: "production" },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    foundryProcess.stdout?.on("data", (data: Buffer) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line) => console.log(`[FoundryVTT] ${line}`));
    });

    foundryProcess.stderr?.on("data", (data: Buffer) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line) => console.error(`[FoundryVTT] ${line}`));
    });

    foundryProcess.on("error", (err) => {
      console.error(`[FoundryVTT] Process error: ${err.message}`);
    });

    foundryProcess.on("exit", (code, signal) => {
      console.log(`[FoundryVTT] Process exited with code ${code}, signal ${signal}`);
      foundryProcess = null;
    });

    setTimeout(() => {
      console.log(`[FoundryVTT] Ready — proxying /foundry → http://localhost:${FOUNDRY_PORT}`);
      resolve();
    }, 5000);
  });
}

function stopFoundryVTT() {
  if (foundryProcess) {
    console.log("[FoundryVTT] Shutting down...");
    foundryProcess.kill("SIGTERM");
    foundryProcess = null;
  }
}

process.on("SIGTERM", () => { stopFoundryVTT(); process.exit(0); });
process.on("SIGINT", () => { stopFoundryVTT(); process.exit(0); });
process.on("exit", () => { stopFoundryVTT(); });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for redirecting old replit.app URLs to cashirts.cl (PRODUCTION ONLY)
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
  
  if (isProduction) {
    const host = req.get('host') || '';
    const originalUrl = req.originalUrl;
    
    if (host.includes('replit.dev') || host.includes('repl.app') || host.includes('replit.app')) {
      if (!originalUrl.startsWith('/api/') && 
          !originalUrl.startsWith('/uploads/') && 
          !originalUrl.includes('.') &&
          !originalUrl.startsWith('/__repl') &&
          !originalUrl.startsWith('/logs') &&
          !originalUrl.startsWith('/foundry')) {
        
        const redirectUrl = `https://cashirts.cl${originalUrl}`;
        console.log(`[REDIRECT] ${host}${originalUrl} -> ${redirectUrl}`);
        return res.redirect(301, redirectUrl);
      }
    }
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await startFoundryVTT();

  app.use(
    "/foundry",
    createProxyMiddleware({
      target: `http://localhost:${FOUNDRY_PORT}`,
      changeOrigin: true,
      ws: true,
      on: {
        error: (err, req, res) => {
          console.error(`[FoundryVTT] Proxy error: ${(err as Error).message}`);
          if (res && typeof (res as Response).status === 'function') {
            (res as Response).status(502).json({ message: "FoundryVTT is not available" });
          }
        },
      },
    })
  );

  try {
    await seedDatabase();
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error instanceof Error ? error.message : 'Unknown error');
    console.warn('Continuing startup despite seeding failure - database may need manual initialization');
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/foundry")) {
      console.log(`[FoundryVTT] WebSocket upgrade for ${req.url}`);
    }
  });
})();
