import express from "express";
import swaggerui from "swagger-ui-express";
import yaml from "yamljs";
import fs from "node:fs";
import { v4 } from "uuid";

const app = express();
const port = 3000;
const swaggerDoc = yaml.load("./docs/docs.yaml");

app.use(express.json());

app.use((req, res, next) => {
  if (req.url == "/favicon.ico") return next();

  res.locals.requestID = v4();

  // Request LOG
  const requestLog = {
    type: "REQUEST",
    timestamp: new Date().toLocaleString(),
    requestID: res.locals.requestID,
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers,
  };

  fs.writeFile(
    process.cwd() + "/logs/requests",
    JSON.stringify(requestLog),
    (err) => {
      if (err) console.log("Error occured while writing REQUEST log: ", err);
    },
  );

  console.log(requestLog);

  const originalJson = res.json;

  res.json = function (body) {
    const responseLog = {
      type: "RESPONSE",
      timestamp: new Date().toLocaleString(),
      requestID: res.locals.requestID, // to correlate with request
      statusCode: res.statusCode,
      body: body,
    };

    fs.writeFile(
      process.cwd() + "/logs/responses",
      JSON.stringify(responseLog),
      (err) => {
        if (err) console.log("Error occured while writing RESPONSE log: ", err);
      },
    );

    console.log(responseLog);
    return originalJson.call(this, body);
  };

  next();
});

app.use("/docs", swaggerui.serve, swaggerui.setup(swaggerDoc));
export { app, port };
