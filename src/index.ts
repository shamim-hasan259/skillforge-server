import type { Application, Request, Response } from "express";
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app: Application = express();

const PORT: number = Number(process.env.PORT) || 5000;

const uri = process.env.MOGNODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env");
}

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("skillforge");
    await client.db("admin").command({ ping: 1 });

    console.log(" Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}

run();

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on :${PORT}`);
});
