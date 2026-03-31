import "dotenv/config";
import app from "./app.js";
import http from "http"
import { initSocket } from "./src/sockets/index.js";

const PORT = process.env.PORT || 3000;
const httpServer=http.createServer(app);
const io=initSocket(httpServer)

httpServer.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});