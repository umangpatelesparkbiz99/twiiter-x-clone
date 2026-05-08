import cluster from "node:cluster";
import os from "node:os";
import app from "./app.ts";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;
const numCPUs = os.availableParallelism?.() || os.cpus().length;

// if (cluster.isPrimary) {
//   console.log(`Primary process ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died. Respawning...`);
//     cluster.fork();
//   });
// } else {
//   app.app.listen(PORT, () => {
//     console.log(`Worker process ${process.pid} started at http://localhost:${PORT}`);
//   });
// }

app.app.listen(PORT, () => {
  console.log(
    ` http://localhost:${PORT}`,
  );
});