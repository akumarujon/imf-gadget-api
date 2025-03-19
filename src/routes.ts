import { StatusCodes } from "http-status-codes";
import { app } from "./app.ts";
import {
  createGadgetRoute,
  defaultRoute,
  deleteGadgetRoute,
  destructGadget,
  getGadgetsRoute,
  registerUser,
  updateGadgetRoute,
  verifyLoginUser,
} from "./handlers.ts";

import express from "express";
import cors from "cors";
import fs from "node:fs";
import { v4 } from "uuid";

import swaggerui from "swagger-ui-express";
import yaml from "yamljs";
import { JSONResponse } from "./types.ts";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "./env.ts";

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

app.use(cors());

const swaggerDoc = yaml.load("./docs/docs.yaml");
app.use("/docs", swaggerui.serve, swaggerui.setup(swaggerDoc));
app.post("/register", registerUser);
app.post("/login", verifyLoginUser);
app.get("/", defaultRoute);

app.use((req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json(
      {
        success: false,
        message: "JWT was not found in headers.",
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
    return;
  }

  try {
    jwt.verify(authHeader.split(" ")[1], SECRET_KEY);
    next();
  } catch (e) {
    if (e.name == "JsonWebTokenError") {
      res.status(StatusCodes.UNAUTHORIZED).json(
        {
          success: false,
          message: "Invalid Token",
          data: [],
          meta: {
            time: new Date().toLocaleString(),
            requestID: res.locals.requestID,
          },
        } satisfies JSONResponse,
      );
    }
  }
});

app.get(["/gadgets", "/gadgets/:id"], getGadgetsRoute);
app.post("/gadgets", createGadgetRoute);
app.patch("/gadgets/:id", updateGadgetRoute);
app.delete("/gadgets:/id", deleteGadgetRoute);
app.post("/gadgets/:id/self-destruct", destructGadget);
