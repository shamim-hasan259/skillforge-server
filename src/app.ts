import type { Application, Request, Response } from "express";
import type _interface = require("./interface/interface");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app: Application = express();

const PORT: number = Number(process.env.PORT) || 5000;

const uri = process.env.MOGNODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env");
}

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URI],
  }),
);
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
    // await client.connect();
    const database = client.db("skillforge");
    const coursesCollection = database.collection("courses");

    app.post("/api/courses", async (req: Request, res: Response) => {
      const course: _interface.Course = req.body;

      const result = await coursesCollection.insertOne(course);

      res.status(201).json({
        status: true,
        message: "Course added successfully",
        data: result,
      });
    });
    app.get("/api/get/courses", async (req: Request, res: Response) => {
      try {
        const { category, search } = req.query;

        const query: Record<string, unknown> = {};

        // Category Filter
        if (category && category !== "All") {
          query.category = category;
        }

        // Search by title
        if (search) {
          query.title = {
            $regex: search,
            $options: "i",
          };
        }

        const result = await coursesCollection.find(query).toArray();

        res.status(200).json({
          success: true,
          message: "Courses fetched successfully",
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    });

    app.get("/api/get/course/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        const result = await coursesCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!result) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Course fetched successfully",
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    });

    app.patch("/api/update/course/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        const updatedData: Partial<_interface.UpdateCourse> = req.body;

        const result = await coursesCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: updatedData,
          },
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "Course updated successfully",
          data: result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }
    });

    app.delete(
      "/api/delete/course/:id",
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;

          const result = await coursesCollection.deleteOne({
            _id: new ObjectId(id),
          });

          if (result.deletedCount === 0) {
            return res.status(404).json({
              success: false,
              message: "Course not found",
            });
          }

          res.status(200).json({
            success: true,
            message: "Course deleted successfully",
            data: result,
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
        }
      },
    );

    // await client.db("admin").command({ ping: 1 });

    console.log(" Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server running on :${PORT}`);
});
