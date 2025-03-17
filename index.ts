import { app, port } from "./src";
import "./src/routes";

app.listen(port, () => {
  console.log("The app is running on http://localhost:3000");
});
