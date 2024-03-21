const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/searchDatabase1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Define the schema for searches
const searchSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  searchPhrase: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// TTL index to automatically delete documents after 14 days
searchSchema.index({ createdAt: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });

// Compound indexes for efficient data retrieval
searchSchema.index({ userId: 1, createdAt: -1 });
searchSchema.index({ searchPhrase: 1, createdAt: -1 });

const Search = mongoose.model("Search", searchSchema);

// In-memory cache for popular searches
let popularSearchesCache = [];
let cacheTimestamp = Date.now();

// Update popular searches cache
async function updatePopularSearchesCache() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    if (db.readyState === 1) {
      const results = await Search.aggregate([
        { $match: { createdAt: { $gte: oneWeekAgo } } },
        { $group: { _id: "$searchPhrase", hits: { $sum: 1 } } },
        { $sort: { hits: -1 } },
        { $limit: 100 },
      ]);
      popularSearchesCache = results;
      cacheTimestamp = Date.now();
    }
  } catch (err) {
    console.error("Error updating cache: ", err);
  }
}

setInterval(updatePopularSearchesCache, 60000); // Update cache every minute

// API Endpoints

// API to check server status
app.get("/hello", (req, res) => {
  res.status(200).end();
});

// Record a new search
app.post("/lastSearch", async (req, res) => {
  const { userId, searchPhrase } = req.body;
  if (!userId || !searchPhrase) {
    return res
      .status(400)
      .json({ error: "Missing userId or searchPhrase in request body" });
  }
  try {
    await new Search({ userId, searchPhrase }).save();
    res.status(201).end();
  } catch (err) {
    console.error("Error saving search: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get the last searches for a user

app.get("/lastSearches", async (req, res) => {
  const { userId } = req.query;
  let { limit } = req.query;

  // Check if userId is provided and not empty
  if (!userId || userId.trim() === "") {
    return res
      .status(400)
      .json({ error: "Missing or empty userId query parameter." });
  }

  // Check if limit is a valid integer and greater than 0
  limit = parseInt(limit, 10); // Parse limit to integer. The radix 10 ensures it's parsed as a decimal number.
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: "Limit must be a positive integer." });
  }

  try {
    const searches = await Search.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ lastSearches: searches.map((search) => search.searchPhrase) });
  } catch (err) {
    console.error("Error fetching last searches: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get the most popular searches
app.get("/mostPopular", async (req, res) => {
  let limit = req.query.limit;
  // Check if limit is a valid integer and greater than 0
  limit = parseInt(limit, 10); // Parse limit to integer. The radix 10 ensures it's parsed as a decimal number.
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: "Limit must be a positive integer." });
  }
  const currentTime = Date.now();
  const timeSinceLastUpdate = (currentTime - cacheTimestamp) / 1000; // Time in seconds

  // Check if the cache is older than 70 seconds
  if (timeSinceLastUpdate > 70) {
    // Trigger cache update without waiting for it to complete
    updatePopularSearchesCache().catch((err) =>
      console.error("Error asynchronously updating cache: ", err)
    );
    // Update the cache timestamp immediately to avoid multiple concurrent updates
    cacheTimestamp = currentTime;
  }

  if (limit <= popularSearchesCache.length) {
    // Serve from cache if it satisfies the limit
    res.json({
      mostSearched: popularSearchesCache.slice(0, limit).map((item) => ({
        searchPhrase: item._id,
        hits: item.hits,
      })),
    });
  } else {
    // Directly query the database for the requested limit
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      const results = await Search.aggregate([
        { $match: { createdAt: { $gte: oneWeekAgo } } },
        { $group: { _id: "$searchPhrase", hits: { $sum: 1 } } },
        { $sort: { hits: -1 } },
        { $limit: limit }, // Fetch the limit as requested by the client
      ]);
      // Respond with the directly queried results
      res.json({
        mostSearched: results.map((item) => ({
          searchPhrase: item._id,
          hits: item.hits,
        })),
      });

      // Use this opportunity to update the cache with the top 100 records from this query
      if (results.length > 100) {
        popularSearchesCache = results.slice(0, 100);
      } else {
        popularSearchesCache = results;
      }
      cacheTimestamp = currentTime; // Update the timestamp after refreshing the cache
    } catch (err) {
      console.error("Error fetching popular searches directly from DB: ", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Health Check Endpoint
app.get("/health", (req, res) => {
  //db.readyState = 0;
  if (db.readyState === 1) {
    res.status(200).end();
  } else {
    res.status(500).json({ error: "Database connection error" });
  }
});

// Start the server
const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  updatePopularSearchesCache(); // Initial cache update
});
