import { app } from "./app";

app.use(async (req, res, next) => {
  const startTime = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = Math.round((seconds * 1000) + (nanoseconds / 1000000));

    const timestamp = new Date().toISOString().slice(0, -1).replace("T", " ");

    console.log(
      `[${timestamp}] [INFO] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`,
    );
  });

  next();
});
