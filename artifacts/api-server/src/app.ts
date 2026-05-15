import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use("/api", router);

// In production, serve the built frontend from the Vite output directory.
// __dirname is injected by esbuild's banner and points to the dist/ folder,
// so ../../syntra/dist/public resolves to artifacts/syntra/dist/public.
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "../../syntra/dist/public");
  app.use(express.static(frontendDist));
  // SPA fallback — all non-API routes serve index.html
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
