import app from "./app.ts";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;

app.app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});