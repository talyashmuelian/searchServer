// server.js

const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 8088;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/searchHistoryDB";

app.use(express.json());

let client;
let db;

// Connect to MongoDB
async function connectToDB() {
  try {
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// Middleware to ensure DB connection
app.use((req, res, next) => {
  if (!db) {
    res.status(500).send("Database connection error");
  } else {
    next();
  }
});

// API 1: HELLO
app.get("/hello", (req, res) => {
  res.sendStatus(200);
});

// API 2: Set a Search Phrase to a User
app.post("/lastSearch", async (req, res) => {
  try {
    const { userId, searchPhrase } = req.body;
    console.log(req.body);
    if (!userId || !searchPhrase) {
      return res.status(400).send("Missing userId or searchPhrase");
    }
    await db
      .collection("searches")
      .insertOne({ userId, searchPhrase, timestamp: new Date() });
    res.status(200).send();
  } catch (error) {
    console.error("Error setting last search:", error);
    res.status(500).send("Internal server error");
  }
});

// API 3: Health
app.get("/health", async (req, res) => {
  try {
    const dbStatus = await client.isConnected();
    if (dbStatus) {
      res.sendStatus(200);
    } else {
      res.status(500).send("Connection to DB is not OK");
    }
  } catch (error) {
    console.error("Error checking database health:", error);
    res.status(500).send("Internal server error");
  }
});

// API 4: Get the Last N Searches for User X
app.get("/lastSearches", async (req, res) => {
  try {
    const { userId, limit } = req.query;
    if (!userId || !limit) {
      return res.status(400).send("Missing userId or limit");
    }
    const searchHistory = await db
      .collection("searches")
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    const lastSearches = searchHistory.map((search) => search.searchPhrase);
    res.status(200).json({ lastSearches });
  } catch (error) {
    console.error("Error fetching last searches:", error);
    res.status(500).send("Internal server error");
  }
});

// API 5: Get the Most Popular Searches
app.get("/mostPopular", async (req, res) => {
  try {
    const { limit } = req.query;
    if (!limit) {
      return res.status(400).send("Missing limit");
    }
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: "$searchPhrase", hits: { $sum: 1 } } },
      { $sort: { hits: -1 } },
      { $limit: parseInt(limit) },
    ];
    const mostSearched = await db
      .collection("searches")
      .aggregate(pipeline)
      .toArray();
    res.status(200).json({ mostSearched });
  } catch (error) {
    console.error("Error fetching most popular searches:", error);
    res.status(500).send("Internal server error");
  }
});

// Start the server
async function startServer() {
  await connectToDB();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

module.exports = app;

// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");

// const app = express();
// const PORT = 8080;

// // Connect to MongoDB
// mongoose
//   .connect("mongodb://localhost:27017/last_searches_db", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Error connecting to MongoDB", err));

// // Create a Mongoose Schema
// const SearchSchema = new mongoose.Schema({
//   userId: { type: String, index: true },
//   searchPhrase: { type: String, index: true },
//   createdAt: { type: Date, default: Date.now, index: true },
// });

// const SearchModel = mongoose.model("Search", SearchSchema);

// app.use(bodyParser.json());

// // API 1: HELLO
// app.get("/hello", (req, res) => {
//   res.sendStatus(200);
// });

// // API 2: Set a search phrase to a user
// app.post("/lastSearch", async (req, res) => {
//   const { userId, searchPhrase } = req.body;
//   if (!userId || !searchPhrase) return res.sendStatus(400);

//   try {
//     await SearchModel.create({ userId, searchPhrase });
//     res.sendStatus(201);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// // API 3: Health
// app.get("/health", (req, res) => {
//   mongoose.connection.db
//     .admin()
//     .ping()
//     .then(() => res.sendStatus(200))
//     .catch((err) => res.status(500).send(err));
// });

// // API 4: Get the last N searches for user X
// app.get("/lastSearches", async (req, res) => {
//   const { userId, limit } = req.query;
//   if (!userId || !limit) return res.sendStatus(400);

//   try {
//     const lastSearches = await SearchModel.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit))
//       .select("searchPhrase -_id");
//     res.json({
//       lastSearches: lastSearches.map((search) => search.searchPhrase),
//     });
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// // API 5: Get the most popular search and number of hits for that search
// app.get("/mostPopular", async (req, res) => {
//   const { limit } = req.query;
//   if (!limit) return res.sendStatus(400);

//   const sevenDaysAgo = new Date();
//   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//   try {
//     const mostPopular = await SearchModel.aggregate([
//       { $match: { createdAt: { $gte: sevenDaysAgo } } },
//       { $group: { _id: "$searchPhrase", hits: { $sum: 1 } } },
//       { $sort: { hits: -1 } },
//       { $limit: parseInt(limit) },
//     ]);
//     res.json({ mostSearched: mostPopular });
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
