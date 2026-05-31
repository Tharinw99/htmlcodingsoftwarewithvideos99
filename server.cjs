var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
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
      let youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=48&q=${encodeURIComponent(q)}&type=video&key=${apiKey}`;
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
      const videos = (data.items || []).filter((item) => item.id && item.id.videoId).map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
      }));
      return res.json({
        videos,
        nextPageToken: data.nextPageToken || null,
        prevPageToken: data.prevPageToken || null
      });
    } catch (error) {
      console.error("Backend error serving youtube-search API:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app.get("/api/youtube/channels", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required for channel search." });
      }
      const customApiKey = req.headers["x-youtube-api-key"];
      const apiKey = customApiKey || process.env.YOUTUBE_API_KEY || "AIzaSyAM-x0pgWy_ypJTYzYqvAjcNT2HKCEQ5L0";
      const channelsUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=channel&key=${apiKey}`;
      const response = await fetch(channelsUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: "Failed to fetch channels from YouTube API", details: errorData });
      }
      const data = await response.json();
      const channels = (data.items || []).map((item) => ({
        channelId: item.id.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        publishedAt: item.snippet.publishedAt
      }));
      return res.json({ channels });
    } catch (error) {
      console.error("Backend error serving youtube-channels API:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app.get("/api/youtube/channelVideos", async (req, res) => {
    try {
      const { channelId, pageToken } = req.query;
      if (!channelId || typeof channelId !== "string") {
        return res.status(400).json({ error: "Query parameter 'channelId' is required." });
      }
      const customApiKey = req.headers["x-youtube-api-key"];
      const apiKey = customApiKey || process.env.YOUTUBE_API_KEY || "AIzaSyAM-x0pgWy_ypJTYzYqvAjcNT2HKCEQ5L0";
      let channelUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&channelId=${channelId}&type=video&order=date&key=${apiKey}`;
      if (pageToken && typeof pageToken === "string") {
        channelUrl += `&pageToken=${pageToken}`;
      }
      const response = await fetch(channelUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: "Failed to fetch channel videos", details: errorData });
      }
      const data = await response.json();
      const videos = (data.items || []).filter((item) => item.id && item.id.videoId).map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
      }));
      return res.json({
        videos,
        nextPageToken: data.nextPageToken || null
      });
    } catch (error) {
      console.error("Backend error serving youtube-channelVideos API:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app.get("/api/youtube/download", async (req, res) => {
    try {
      const { videoId, format, quality, title } = req.query;
      let videoTitle = title || "youtube_media_extract";
      const customApiKey = req.headers["x-youtube-api-key"] || req.query.apiKey;
      const apiKey = customApiKey || process.env.YOUTUBE_API_KEY || "AIzaSyAM-x0pgWy_ypJTYzYqvAjcNT2HKCEQ5L0";
      if (videoId && typeof videoId === "string" && videoId.length > 3) {
        try {
          const metaRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
          if (metaRes.ok) {
            const metaData = await metaRes.json();
            if (metaData.items && metaData.items[0]) {
              videoTitle = metaData.items[0].snippet.title;
            }
          }
        } catch (err) {
          console.error("Failed to fetch video title using API key:", err);
        }
      }
      const safeTitle = videoTitle.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "extracted_media";
      const isAudio = format === "mp3" || format === "m4a";
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.${format}"`);
      if (isAudio) {
        res.setHeader("Content-Type", "audio/mpeg");
        const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        const fileStream = await fetch(audioUrl);
        if (fileStream.ok && fileStream.body) {
          const reader = fileStream.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
          res.end();
        } else {
          res.status(500).end();
        }
      } else {
        res.setHeader("Content-Type", "video/mp4");
        const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
        const fileStream = await fetch(videoUrl);
        if (fileStream.ok && fileStream.body) {
          const reader = fileStream.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
          res.end();
        } else {
          res.status(500).end();
        }
      }
    } catch (e) {
      console.error("Downloader pipeline error:", e);
      if (!res.headersSent) {
        res.status(500).json({ error: e.message || "Download streaming failure" });
      }
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
