import express from "express";
import swaggerui from "swagger-ui-express";
import yaml from "yamljs";

const app = express();
const port = 3000;
const swaggerDoc = yaml.load("./docs/docs.yaml");

app.use("/docs", swaggerui.serve, swaggerui.setup(swaggerDoc));
app.use(express.json());

export { app, port };
