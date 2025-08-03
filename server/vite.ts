import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { renderPage, createHTMLTemplate } from "./ssr";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Handle SSR for static pages
      const ssrRoutes = ['/', '/about', '/blog', '/terms', '/privacy', '/contact'];
      if (ssrRoutes.includes(url)) {
        try {
          const { html, dehydratedState, title, description, keywords } = await renderPage(url);
          const fullHtml = createHTMLTemplate(html, dehydratedState, title, description, keywords);
          res.status(200).set({ "Content-Type": "text/html" }).end(fullHtml);
          return;
        } catch (ssrError) {
          console.error("SSR Error:", ssrError);
          // Fall back to client-side rendering if SSR fails
        }
      }

      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Handle SSR for static pages in production
  const ssrRoutes = ['/', '/about', '/blog', '/terms', '/privacy', '/contact'];
  
  ssrRoutes.forEach(route => {
    app.get(route, async (req, res) => {
      try {
        const { html, dehydratedState, title, description, keywords } = await renderPage(route);
        const fullHtml = createHTMLTemplate(html, dehydratedState, title, description, keywords);
        res.status(200).set({ "Content-Type": "text/html" }).end(fullHtml);
      } catch (ssrError) {
        console.error("SSR Error:", ssrError);
        // Fall back to static file if SSR fails
        res.sendFile(path.resolve(distPath, "index.html"));
      }
    });
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
