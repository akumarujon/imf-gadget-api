import { app, port } from "./src";
import "./src/routes";
import "./src/debugger";

app.listen(port, () => {
  console.log("The app is running on http://localhost:3000");
});
