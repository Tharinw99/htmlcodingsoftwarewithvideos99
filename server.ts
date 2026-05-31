import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const { q, order, videoDuration, pageToken } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required." });
      }

      const customApiKey = req.headers["x-youtube-api-key"];
      const apiKey = customApiKey || process.env.YOUTUBE_API_KEY || "AIzaSyAM-x0pgWy_ypJTYzYqvAjcNT2HKCEQ5L0";
      if (!apiKey) {
        console.error("Missing YOUTUBE_API_KEY environment variable");
        return res.status(500).json({ error: "API key is not configured on the server. Please provide it in settings." });
      }
      
      // Clean URL without any hidden time/date filters (like publishedAfter) to open results to all years.
      let youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=48&q=${encodeURIComponent(q)}&type=video&key=${apiKey}`;

      // Default the search ordering strictly to "relevance" if no custom order is selected.
      // This preventschronological drowning and brings back older, legendary high-quality matches.
      const sortOrder = order && typeof order === "string" ? order : "relevance";
      youtubeUrl += `&order=${sortOrder}`;

      if (videoDuration && typeof videoDuration === "string" && videoDuration !== "any") {
        youtubeUrl += `&videoDuration=${videoDuration}`;
      }
      if (pageToken && typeof pageToken === "string") {
        youtubeUrl += `&pageToken=${pageToken}`;
      }

      const response = await fetch(youtubeUrl);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("YouTube API error:", errorData);
        return res.status(response.status).json({ error: "Failed to fetch from YouTube API", details: errorData });
      }

      const data = await response.json();
      
      const videos = (data.items || [])
        .filter((item: any) => item.id && item.id.videoId)
        .map((item: any) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
        }));

      return res.json({ 
        videos, 
        nextPageToken: data.nextPageToken || null,
        prevPageToken: data.prevPageToken || null
      });
    } catch (error: any) {
      console.error("Backend error serving youtube-search API:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development / Static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
