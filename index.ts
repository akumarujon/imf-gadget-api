import { app, port } from "./src/index.ts";
import "./src/routes.ts";

app.listen(port, () => {
  console.log("The app is running on http://localhost:3000");
});
