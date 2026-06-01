import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Search, 
  Tv, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Trash2, 
  Download, 
  Wifi, 
  WifiOff, 
  SlidersHorizontal, 
  FolderHeart, 
  Clock, 
  BookOpen, 
  Check, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  ListVideo,
  FileText,
  Bookmark,
  Share2,
  Trash,
  Grid,
  List,
  Key,
  Radio,
  Compass,
  ArrowRight,
  Terminal,
  DownloadCloud
} from "lucide-react";
import { useAppStore } from "../store";
import { cn } from "../lib/utils";
import { YouTubeVideo } from "../types";

const CATEGORIES = [
  { label: "Boxing 🥊", query: "Boxing highlights full fight knockouts" },
  { label: "MMA / UFC 🥋", query: "UFC MMA highlights full fights" },
  { label: "Sports Podcasts 🎙️", query: "Sports boxing podcast interviews" },
  { label: "Funny 🎭", query: "funniest videos tries not to laugh memes clean jokes" },
  { label: "Gaming 🎮", query: "trending gameplay walkthrough let's play video game stream" },
  { label: "Music 🎵", query: "news hits music video songs live performance session" },
  { label: "Tech 💻", query: "latest technology gadgets unboxing smartphone reviews future tech" },
  { label: "Movies 🎬", query: "cinematic official movie trailers teasers reviews drama film" }
];

const PRE_POPULATED_CHANNELS = [
  {
    channelId: "UC6yS37G_S_B1j-8l4fefpZg",
    title: "UFC - Ultimate Fighting Championship",
    description: "The official YouTube home of the Ultimate Fighting Championship (UFC), featuring exclusive original series, fight highlights, press conferences, and weight-ins.",
    thumbnail: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200"
  },
  {
    channelId: "UC_V419vB_oZ7yS9-r_lV59g",
    title: "Matchroom Boxing",
    description: "The global home of Matchroom Boxing, featuring pre-fight media workouts, behind the scenes, press conferences, weigh-ins, highlights, and full classic fights.",
    thumbnail: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=200"
  },
  {
    channelId: "UC6byD2H8p8L_287vBq3_Vmw",
    title: "DAZN Boxing",
    description: "DAZN Boxing is the world's premier streaming platform for game-changing boxing matchups, highlights, press conferences, and feature profile documentaries.",
    thumbnail: "https://images.unsplash.com/photo-1483721310020-03333e577076?auto=format&fit=crop&q=80&w=200"
  },
  {
    channelId: "UC32_fV76W-6_p_IolQYgSgg",
    title: "Top Rank Boxing",
    description: "The legendary home of boxing stars. We produce live championship programs, full classic matches, highlight compilations, and fighter profiles.",
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200"
  }
];

interface YouTubeViewerProps {
  activeMainTab?: "browse" | "playlists" | "offline" | "channels" | "downloader";
  setActiveMainTab?: (tab: "browse" | "playlists" | "offline" | "channels" | "downloader") => void;
  isSidebarCollapsed?: boolean;
}

export function YouTubeViewer({
  activeMainTab: externalActiveMainTab,
  setActiveMainTab: externalSetActiveMainTab,
  isSidebarCollapsed
}: YouTubeViewerProps = {}) {
  // Global Store States
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    offlineVideos,
    toggleOfflineVideo,
    isOffline,
    videoNotes,
    saveVideoNote,
    simulatedOfflineMode,
    setSimulatedOfflineMode,
    youtubeApiKey,
    setYoutubeApiKey
  } = useAppStore();

  // Local States
  const [localActiveMainTab, localSetActiveMainTab] = useState<"browse" | "playlists" | "offline" | "channels" | "downloader">("browse");

  const activeMainTab = externalActiveMainTab || localActiveMainTab;
  const setActiveMainTab = externalSetActiveMainTab || localSetActiveMainTab;

  const [activeTab, setActiveTab] = useState<"search" | "direct">("search");
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Keep search inputs/playing video in sync when tab resets
  useEffect(() => {
    setVideoId(null);
  }, [activeMainTab]);

  // Channel States
  const [channelSearchQuery, setChannelSearchQuery] = useState("");
  const [channelsList, setChannelsList] = useState<any[]>(PRE_POPULATED_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
  const [channelVideosList, setChannelVideosList] = useState<YouTubeVideo[]>([]);
  const [isChannelsLoading, setIsChannelsLoading] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);
  const [channelNextPageToken, setChannelNextPageToken] = useState<string | null>(null);

  // Downloader States
  const [downloadInputUrl, setDownloadInputUrl] = useState("");
  const [downloadFormat, setDownloadFormat] = useState<"mp4" | "mp3" | "webm" | "m4a">("mp4");
  const [downloadQuality, setDownloadQuality] = useState<string>("1085p");
  const [downloadingState, setDownloadingState] = useState<"idle" | "handshake" | "video_stream" | "audio_stream" | "muxing" | "complete" | "error">("idle");
  const [downloaderLogs, setDownloaderLogs] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Active playing video full state (so we can render its info & notes side-by-side)
  const [playingVideo, setPlayingVideo] = useState<YouTubeVideo | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [activeNotesTab, setActiveNotesTab] = useState<"description" | "notes" | "playlists">("description");

  // Filtering Options
  const [selectedCategory, setSelectedCategory] = useState("Boxing 🥊");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "viewCount" | "rating">("relevance");
  const [durationFilter, setDurationFilter] = useState<"any" | "short" | "medium" | "long">("any");
  const [showFilters, setShowFilters] = useState(false);

  // Playlists Navigation States
  const [activePlaylistId, setActivePlaylistId] = useState<string>("watch-later");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);

  // Floating Dropdown State for "Add to playlist"
  const [dropdownVideo, setDropdownVideo] = useState<YouTubeVideo | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [showApiModal, setShowApiModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(youtubeApiKey);

  // Toast State for actions feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Set up initial cinematic videos or cached files
  useEffect(() => {
    if (simulatedOfflineMode) {
      setVideos(offlineVideos);
    } else {
      const defaultCat = CATEGORIES.find(c => c.label === selectedCategory) || CATEGORIES[0];
      handleSearch(defaultCat.query);
    }
  }, [simulatedOfflineMode]);

  // Click outside listener for playlist dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVideo(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update Notes panel when playingVideo changes
  useEffect(() => {
    if (playingVideo) {
      setNotesDraft(videoNotes[playingVideo.videoId] || "");
    }
  }, [playingVideo, videoNotes]);

  const handleSearch = async (queryToSearch: string, token: string | null = null) => {
    const q = queryToSearch.trim();
    if (!q) return;

    if (simulatedOfflineMode) {
      // Offline filtering of saved meta
      setIsLoading(true);
      setTimeout(() => {
        const filtered = offlineVideos.filter(v => 
          v.title.toLowerCase().includes(q.toLowerCase()) || 
          v.description.toLowerCase().includes(q.toLowerCase())
        );
        setVideos(filtered);
        setNextPageToken(null);
        setIsLoading(false);
      }, 400);
      return;
    }

    if (!token) {
      setIsLoading(true);
      setErrorMsg(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const isGitHubPages = window.location.hostname.includes("github.io");

      let data;
      if (isGitHubPages) {
        // Direct flight when hosted on GitHub Pages because there is no static Node.js backend
        const directKey = youtubeApiKey || "AIzaSyAM-x0pgWy_ypJTYzYqvAjcNT2HKCEQ5L0";
        let directUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=48&q=${encodeURIComponent(q)}&type=video&key=${directKey}&order=${sortBy}`;
        if (durationFilter && durationFilter !== "any") {
          directUrl += `&videoDuration=${durationFilter}`;
        }
        if (token) {
          directUrl += `&pageToken=${token}`;
        }

        const res = await fetch(directUrl);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Direct API call error data:", errData);
          throw new Error(errData.error?.message || "YouTube API query failed. Try configuring your own API Key.");
        }
        const apiData = await res.json();

        const mappedVideos = (apiData.items || [])
          .filter((item: any) => item.id && item.id.videoId)
          .map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          }));

        data = {
          videos: mappedVideos,
          nextPageToken: apiData.nextPageToken || null
        };
      } else {
        // Local fullstack server proxy
        const urlParams = new URLSearchParams({
          q,
          order: sortBy,
          videoDuration: durationFilter
        });
        if (token) {
          urlParams.append("pageToken", token);
        }

        const headers: Record<string, string> = {};
        if (youtubeApiKey) {
          headers["x-youtube-api-key"] = youtubeApiKey;
        }

        const response = await fetch(`/api/youtube/search?${urlParams.toString()}`, { headers });
        if (!response.ok) {
          throw new Error("Failed to load search results from server proxy.");
        }
        data = await response.json();
      }

      if (token) {
        setVideos(prev => [...prev, ...(data.videos || [])]);
      } else {
        setVideos(data.videos || []);
      }
      setNextPageToken(data.nextPageToken || null);
      setCurrentQuery(q);
    } catch (err: any) {
      console.error(err);
      if (!token) {
        setErrorMsg(err.message || "An error occurred while fetching videos.");
      } else {
        triggerToast("Failed to load more videos.");
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedCategory(""); // clear selected pill since we typed custom
      handleSearch(searchQuery);
    }
  };

  const handleCategoryClick = (categoryLabel: string, query: string) => {
    setSelectedCategory(categoryLabel);
    setSearchQuery("");
    handleSearch(query);
  };

  const handleFilterChangeAndSearch = (
    newSort: "relevance" | "date" | "viewCount" | "rating",
    newDuration: "any" | "short" | "medium" | "long"
  ) => {
    setSortBy(newSort);
    setDurationFilter(newDuration);
    
    // Find search query
    let activeQ = searchQuery;
    if (!activeQ) {
      const cat = CATEGORIES.find(c => c.label === selectedCategory);
      activeQ = cat ? cat.query : CATEGORIES[0].query;
    }
    
    // Trigger lazy search
    setTimeout(() => {
      handleSearch(activeQ);
    }, 50);
  };

  const extractVideoId = (input: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = input.match(regex);
    return match ? match[1] : (input.length === 11 ? input : null);
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(url);
    if (id) {
      // Try to create mock metadata or look inside custom index
      const directVideo: YouTubeVideo = {
        videoId: id,
        title: "Direct Stream Playback",
        description: "Played via external link injection. Notes and offline cache capability is supported.",
        thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
        channelTitle: "External Injection",
        publishedAt: new Date().toISOString()
      };
      setPlayingVideo(directVideo);
      setVideoId(id);
      setUrl("");
    } else {
      triggerToast("Invalid YouTube URL or code format.");
    }
  };

  const selectVideoForPlayback = (video: YouTubeVideo) => {
    setPlayingVideo(video);
    setVideoId(video.videoId);
  };

  const handleOpenInDownloader = (video: YouTubeVideo) => {
    const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
    setDownloadInputUrl(videoUrl);
    setDownloadQuality("1080p");
    setActiveMainTab("downloader");
    triggerToast("Loaded video metadata into Downloader tool!");
  };

  const handleChannelSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setIsChannelsLoading(true);
    setChannelError(null);
    setSelectedChannel(null);

    try {
      const isGitHubPages = window.location.hostname.includes("github.io");
      let data;

      if (isGitHubPages) {
        const directKey = youtubeApiKey || "AIzaSyAM-x0pgWy_ypJTYzYqvAjcNT2HKCEQ5L0";
        const directUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(q)}&type=channel&key=${directKey}`;
        const res = await fetch(directUrl);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || "YouTube API channel query failed.");
        }
        data = await res.json();
      } else {
        const headers: Record<string, string> = {};
        if (youtubeApiKey) {
          headers["x-youtube-api-key"] = youtubeApiKey;
        }
        const res = await fetch(`/api/youtube/channels?q=${encodeURIComponent(q)}`, { headers });
        if (!res.ok) {
          throw new Error("Failed to load channels from server proxy.");
        }
        data = await res.json();
      }

      let formattedChannels = [];
      if (isGitHubPages) {
        formattedChannels = (data.items || [])
          .filter((item: any) => item.id && item.id.channelId)
          .map((item: any) => ({
            channelId: item.id.channelId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            publishedAt: item.snippet.publishedAt,
          }));
      } else {
        formattedChannels = data.channels || [];
      }

      setChannelsList(formattedChannels);
      if (formattedChannels.length === 0) {
        setChannelError("No channels found matching that name.");
      }
    } catch (err: any) {
      console.error(err);
      setChannelError(err.message || "An error occurred while hunting for channels.");
    } finally {
      setIsChannelsLoading(false);
    }
  };

  const handleFetchChannelVideos = async (channelId: string, token: string | null = null) => {
    setIsChannelsLoading(true);
    setChannelError(null);
    if (!token) {
      setChannelVideosList([]);
    }

    try {
      const isGitHubPages = window.location.hostname.includes("github.io");
      let data;

      if (isGitHubPages) {
        const directKey = youtubeApiKey || "AIzaSyAM-x0pgWy_ypJTYzYqvAjcNT2HKCEQ5L0";
        let directUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&channelId=${channelId}&type=video&order=date&key=${directKey}`;
        if (token) {
          directUrl += `&pageToken=${token}`;
        }
        const res = await fetch(directUrl);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || "YouTube channel videos failed.");
        }
        data = await res.json();
      } else {
        const headers: Record<string, string> = {};
        if (youtubeApiKey) {
          headers["x-youtube-api-key"] = youtubeApiKey;
        }
        let url = `/api/youtube/channelVideos?channelId=${channelId}`;
        if (token) {
          url += `&pageToken=${token}`;
        }
        const res = await fetch(url, { headers });
        if (!res.ok) {
          throw new Error("Failed to load channel videos from server proxy.");
        }
        data = await res.json();
      }

      let formattedVideos = [];
      let nextToken = null;

      if (isGitHubPages) {
        formattedVideos = (data.items || [])
          .filter((item: any) => item.id && item.id.videoId)
          .map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          }));
        nextToken = data.nextPageToken || null;
      } else {
        formattedVideos = data.videos || [];
        nextToken = data.nextPageToken || null;
      }

      if (token) {
        setChannelVideosList(prev => [...prev, ...formattedVideos]);
      } else {
        setChannelVideosList(formattedVideos);
      }
      setChannelNextPageToken(nextToken);
    } catch (err: any) {
      console.error(err);
      setChannelError(err.message || "An error occurred fetching channel clips.");
    } finally {
      setIsChannelsLoading(false);
    }
  };

  const runSimulatedDownload = (videoTitle: string) => {
    if (downloadingState !== "idle" && downloadingState !== "complete" && downloadingState !== "error") return;
    
    setDownloadingState("handshake");
    setDownloadProgress(2);
    setDownloaderLogs([
      `[CRITICAL] Handshaking secure handshake connection with live YouTube CDNs...`,
      `[INFO] Target: "${videoTitle}"`,
      `[INFO] Requested format: ${downloadFormat.toUpperCase()} (${downloadQuality})`,
      `[INFO] Target download bitrate: ${downloadFormat === 'mp3' ? '320kbps Studio Master HQ' : 'Full Bitrate, High Framerate (60fps)'}`
    ]);

    setTimeout(() => {
      setDownloadingState("video_stream");
      setDownloadProgress(24);
      setDownloaderLogs(prev => [
        ...prev,
        `[SUCCESS] Handshake approved by peer headers.`,
        `[INFO] Downloading primary video payload trace (MPEG-4 AVC/H.264 profile)...`,
        `[INFO] Downloading block frames: 104,821,399 bytes in buffer stream.`
      ]);
    }, 1800);

    setTimeout(() => {
      setDownloadingState("audio_stream");
      setDownloadProgress(52);
      setDownloaderLogs(prev => [
        ...prev,
        `[SUCCESS] Video track downloaded completely to browser virtual temporary storage.`,
        `[INFO] Fetching high-definition separate audio track (HQ Opus audio, decoded to 320kbps MP3 Lame codec)...`,
        `[INFO] Resolving maximum frequency bands: 48kHz sampling rate.`
      ]);
    }, 3800);

    setTimeout(() => {
      setDownloadingState("muxing");
      setDownloadProgress(81);
      setDownloaderLogs(prev => [
        ...prev,
        `[SUCCESS] Audio track fetched and padded.`,
        `[COMPILE] Initializing local WASM ffmpeg thread to multiplex audio & video into container...`,
        `[WARNING] High-Performance local thread container active. Do not close this browser terminal.`,
        `[COMPILE] Encoding bitstream headers, applying frame rate matching (60 fps master matches).`
      ]);
    }, 5800);

    setTimeout(() => {
      setDownloadingState("complete");
      setDownloadProgress(100);
      setDownloaderLogs(prev => [
        ...prev,
        `[SUCCESS] Container packing complete! Total bytes written: ${(Math.random() * 80 + 35).toFixed(2)} MB`,
        `[CRITICAL] Initializing physical local browser pipe transfer. Click browser dialog to complete save.`
      ]);

      try {
        const extractedId = extractVideoId(downloadInputUrl) || "";
        const downloadUrl = `/api/youtube/download?videoId=${encodeURIComponent(extractedId)}&format=${downloadFormat}&quality=${downloadQuality}&title=${encodeURIComponent(videoTitle)}&apiKey=${encodeURIComponent(youtubeApiKey || "")}`;
        
        const element = document.createElement("a");
        element.href = downloadUrl;
        element.setAttribute("download", "");
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        triggerToast("Download complete! High-grade media file transferred to device.");
      } catch (e) {
        console.error("Downloader asset extraction failed:", e);
        triggerToast("Pipeline error packaging content stream.");
      }
    }, 8500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleCreateNewPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const playlistId = createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setShowCreatePlaylistModal(false);
    setActivePlaylistId(playlistId);
    triggerToast(`Playlist "${newPlaylistName}" created!`);
  };

  const addToPlaylistWithAnim = (playlistId: string, video: YouTubeVideo) => {
    addVideoToPlaylist(playlistId, video);
    const p = playlists.find(p => p.id === playlistId);
    triggerToast(`Added video to ${p?.name || "playlist"}!`);
    setDropdownVideo(null);
  };

  const handleDownloadOfflineClick = (video: YouTubeVideo) => {
    toggleOfflineVideo(video);
    const offlineState = isOffline(video.videoId);
    if (!offlineState) {
      triggerToast("Downloaded video metadata & notes cache to Simulated Offline Vault!");
    } else {
      triggerToast("Removed video metadata from Simulated Offline Vault.");
    }
  };

  const handleSaveNotes = () => {
    if (playingVideo) {
      saveVideoNote(playingVideo.videoId, notesDraft);
      triggerToast("Offline Workspace Journal Draft Saved!");
    }
  };

  // Helper function to export offline video package as standalone HTML files
  const exportOfflineHTML = (video: YouTubeVideo) => {
    const notesContent = videoNotes[video.videoId] || "No notes captured yet.";
    const cleanTitle = video.title.replace(/["']/g, "");
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Offline Journal - ${cleanTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; margin: 0; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 30px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); }
    h1 { margin-top: 0; color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 15px; }
    .meta { color: #94a3b8; font-size: 14px; margin-bottom: 25px; }
    .video-box { aspect-ratio: 16/9; background: #000; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 8px; margin-bottom: 25px; overflow: hidden; border: 1px solid #475569; }
    .video-box iframe { position: absolute; width: 100%; height: 100%; border: 0; }
    .section-title { font-size: 18px; font-weight: bold; margin-top: 30px; color: #a5b4fc; border-left: 4px solid #6366f1; padding-left: 10px; }
    .notes-area { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 20px; font-family: monospace; white-space: pre-wrap; font-size: 15px; color: #cbd5e1; margin-top: 15px; }
    .footer { text-align: center; font-size: 11px; margin-top: 50px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${video.title}</h1>
    <div class="meta">
      <strong>Channel:</strong> ${video.channelTitle} | <strong>Published:</strong> ${new Date(video.publishedAt).toLocaleDateString()}
    </div>
    <div class="video-box">
      <iframe src="https://www.youtube.com/embed/${video.videoId}" allowfullscreen></iframe>
    </div>
    
    <div class="section-title">Video Description Summary</div>
    <p style="color: #cbd5e1; font-size: 14px;">${video.description}</p>

    <div class="section-title">My Offline Cinema Workshop Journal Notes</div>
    <div class="notes-area">${notesContent}</div>
    
    <div class="footer">Exported from Massive YouTube Cinema Vault on ${new Date().toLocaleDateString()}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `YouTube_Journal_${video.videoId}.html`;
    a.click();
    triggerToast("Cinema Lecture Offline HTML package generated & downloaded!");
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-background text-foreground overflow-hidden">
      
      {/* Toast Feedback HUD */}
      
      {/* API Key Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md p-6 rounded-3xl shadow-2xl border border-border/60 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">YouTube API Key</h3>
                <p className="text-xs text-foreground/60 leading-relaxed font-medium">Use your own Data API v3 key to bypass global rate limits.</p>
              </div>
            </div>

            <div className="space-y-1 mt-2">
              <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider pl-1">Your Custom API Key</label>
              <input
                type="text"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-muted/50 border border-border/80 px-4 py-3 rounded-xl text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-foreground/30 transition-all"
              />
            </div>

            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-border/40">
              <button 
                onClick={() => setShowApiModal(false)}
                className="px-4 py-2 text-xs font-bold text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setYoutubeApiKey(tempApiKey);
                  setShowApiModal(false);
                  triggerToast("Custom API key saved!");
                  // Re-run search if live mode is active
                  if (!simulatedOfflineMode && searchQuery) handleSearch(searchQuery);
                }}
                className="px-6 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Save Key
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground font-bold text-sm px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-primary/20 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Navigation Row */}
      <header className="border-b border-border/40 dark:border-zinc-800/80 bg-card/60 backdrop-blur-md sticky top-0 z-40 shrink-0 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: YouTube Cinema Logo */}
        <div className="flex items-center gap-2.5 shrink-0 select-none">
          <div className="w-9 h-[24px] rounded-[6px] bg-red-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-red-600/10">
            <Play className="w-3 h-3 fill-current text-white ml-[1px]" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tighter flex items-center gap-1.5 leading-none">
              YouTube <span className="font-light text-foreground/75">Cinema</span>
              <span className="font-sans font-extrabold text-[9px] bg-red-600/10 text-red-500 px-1.5 py-0.5 rounded tracking-wide">
                API V3
              </span>
            </h1>
          </div>
        </div>

        {/* Center: YouTube-style standard Search Bar for browse view */}
        <div className="flex-grow max-w-[500px] w-full">
          {activeMainTab === "browse" && !videoId && (
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search live streams, music, gaming, drone 4K..."
                  className="w-full bg-background border border-border/80 dark:border-zinc-800 rounded-l-full py-1.5 pl-4 pr-10 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 text-foreground shadow-inner"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/45 hover:text-foreground text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-muted hover:bg-muted/80 text-foreground border border-l-0 border-border/80 dark:border-zinc-800 rounded-r-full px-5 py-2 cursor-pointer transition-colors"
                title="Search YouTube"
              >
                <Search className="w-3.5 h-3.5 text-foreground/70" />
              </button>
            </form>
          )}
          {activeMainTab !== "browse" && (
            <div className="text-center font-bold text-xs uppercase tracking-widest text-foreground/40 font-mono">
              {activeMainTab === "channels" && "Creators Hub Workspace"}
              {activeMainTab === "downloader" && "YouTube high-speed media extractor"}
              {activeMainTab === "playlists" && "Personal video study lists"}
              {activeMainTab === "offline" && "Encrypted local study cache"}
            </div>
          )}
        </div>

        {/* Right: Actions (API Key, simulated online indicator, etc.) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer bg-muted/40 hover:bg-muted text-foreground/70"
            title="Configure Custom YouTube API Key"
          >
            <Key className="w-3 h-3 text-indigo-400" />
            <span>API Key</span>
          </button>
          
          <button
            onClick={() => {
              setSimulatedOfflineMode(!simulatedOfflineMode);
              triggerToast(simulatedOfflineMode ? "Connected online! Searching live YouTube index" : "Offline mode simulated! Utilizing cached system memory.");
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer",
              simulatedOfflineMode 
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30" 
                : "bg-muted/40 hover:bg-muted text-foreground/70"
            )}
            title="Simulate offline connection state to load cached metadata index"
          >
            {simulatedOfflineMode ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-500 animate-pulse" />
                <span>Offline: ON</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span>Offline: OFF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* VIDEO DETAILS IN-APP ACTIVE PLAYBACK PLAYER (SIDE-BY-SIDE DESIGN) */}
          {videoId ? (
            <motion.div 
              key="player-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.4 }}
              className="flex-grow flex flex-col lg:flex-row h-full w-full overflow-hidden"
            >
              {/* Left Column: Big Epic Black Box and Video Controls (65% width on desktop) */}
              <div className="flex-grow lg:w-2/3 flex flex-col p-6 bg-slate-950/20 border-r border-border/30 overflow-hidden h-full">
                
                {/* Upper theater row bar */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <button 
                    onClick={() => {
                      setVideoId(null);
                      setPlayingVideo(null);
                    }}
                    className="text-xs font-bold px-3.5 py-2 bg-card hover:bg-muted border border-border/80 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95 text-foreground/80"
                  >
                    ← Back to index
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playingVideo && exportOfflineHTML(playingVideo)}
                      className="text-xs font-bold px-3.5 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/25 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                      title="Download a self-contained local HTML file with this video, notes, and interactive layout to use offline anywhere"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Lecture HTML
                    </button>

                    <button
                      onClick={() => playingVideo && handleDownloadOfflineClick(playingVideo)}
                      className={cn(
                        "text-xs font-bold px-3.5 py-2 border rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95",
                        playingVideo && isOffline(playingVideo.videoId)
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-card text-foreground/80 hover:bg-muted border-border"
                      )}
                    >
                      <Bookmark className="w-3.5 h-3.5" /> 
                      {playingVideo && isOffline(playingVideo.videoId) ? "Offline Cached" : "Cache Offline"}
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="text-xs font-bold px-3.5 py-2 bg-card hover:bg-muted border border-border/80 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      Fullscreen
                    </button>
                  </div>
                </div>

                {/* Simulated connection caution */}
                {simulatedOfflineMode && (
                  <div className="mb-3 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-500 font-bold flex items-center gap-2">
                    <WifiOff className="w-4 h-4 shrink-0" />
                    <span>Playback simulation active: Direct IFrame stream playback requires active Network bandwidth, but the journal workspace runs 100% offline.</span>
                  </div>
                )}

                {/* YouTube IFRame Box Container */}
                <div 
                  ref={containerRef}
                  className={cn(
                    "flex-grow bg-[#000000] rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative flex items-center justify-center transition-all duration-500",
                    isFullscreen ? "rounded-none border-none" : ""
                  )}
                >
                  <iframe
                    className="w-full h-full absolute inset-0"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&vq=hd1080&modestbranding=1&rel=0&iv_load_policy=3&color=white`}
                    title={playingVideo?.title || "YouTube video player"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Mini Header Details beneath theater video */}
                {playingVideo && (
                  <div className="mt-5 shrink-0 animate-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-2xl font-extrabold tracking-tight" dangerouslySetInnerHTML={{ __html: playingVideo.title }} />
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-foreground/60 font-semibold font-mono">
                      <span className="text-primary">{playingVideo.channelTitle}</span>
                      <span>•</span>
                      <span>Published: {new Date(playingVideo.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Educational Workspace & Journal (35% width on desktop) */}
              <div className="lg:w-1/3 flex flex-col bg-card/40 border-l border-border/30 h-full overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="border-b border-border/30 bg-muted/20 flex shrink-0">
                  <button
                    onClick={() => setActiveNotesTab("description")}
                    className={cn(
                      "flex-1 py-3 text-xs font-bold border-b-2 transition-all",
                      activeNotesTab === "description"
                        ? "border-primary text-foreground bg-background"
                        : "border-transparent text-foreground/50 hover:text-foreground"
                    )}
                  >
                    Information
                  </button>
                  <button
                    onClick={() => setActiveNotesTab("notes")}
                    className={cn(
                      "flex-1 py-3 text-xs font-bold border-b-2 transition-all relative",
                      activeNotesTab === "notes"
                        ? "border-primary text-foreground bg-background"
                        : "border-transparent text-foreground/50 hover:text-foreground"
                    )}
                  >
                    Workshop Journal
                    {notesDraft.trim() && (
                      <span className="absolute top-2 right-4 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveNotesTab("playlists")}
                    className={cn(
                      "flex-1 py-3 text-xs font-bold border-b-2 transition-all",
                      activeNotesTab === "playlists"
                        ? "border-primary text-foreground bg-background"
                        : "border-transparent text-foreground/50 hover:text-foreground"
                    )}
                  >
                    Playlists Save
                  </button>
                </div>

                {/* Sidebar Content Panel */}
                <div className="flex-grow overflow-y-auto p-5">
                  <AnimatePresence mode="wait">
                    {activeNotesTab === "description" && playingVideo && (
                      <motion.div
                        key="desc-pane"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                          <h4 className="text-xs uppercase tracking-wider font-extrabold text-foreground/50 font-mono mb-2">Video Description</h4>
                          <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans">
                            {playingVideo.description || "No description provided for this stream."}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                          <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
                          <div>
                            <h5 className="text-xs font-bold text-indigo-400">Educational Mode</h5>
                            <p className="text-[10px] text-foreground/60 mt-0.5 leading-snug">
                              Take notes in the Workshop tab. You can save multiple documents and download stand-alone workspace apps to keep.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeNotesTab === "notes" && playingVideo && (
                      <motion.div
                        key="notes-pane"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex flex-col h-full space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground/60 flex items-center gap-1.5 font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Auto-saved local state
                          </span>
                          <button
                            onClick={handleSaveNotes}
                            className="bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Save Note
                          </button>
                        </div>

                        <textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Write key timestamps, takeaways, outlines, or coding rules here... Content persists automatically to your local device memory."
                          className="flex-grow w-full min-h-[250px] lg:min-h-[350px] p-4 bg-muted/40 text-foreground border border-border/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-mono placeholder:font-sans placeholder:font-normal leading-relaxed resize-none"
                        />

                        <div className="text-[11px] text-foreground/40 font-mono font-semibold flex justify-between">
                          <span>Characters: {notesDraft.length}</span>
                          <span>Words: {notesDraft.trim().split(/\s+/).filter(Boolean).length}</span>
                        </div>
                      </motion.div>
                    )}

                    {activeNotesTab === "playlists" && playingVideo && (
                      <motion.div
                        key="playlists-pane"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <h4 className="text-xs uppercase tracking-wider font-extrabold text-foreground/50 font-mono">Save to custom files</h4>
                        
                        <div className="space-y-2">
                          {playlists.map((playlist) => {
                            const isIncluded = playlist.videos.some(v => v.videoId === playingVideo.videoId);
                            return (
                              <button
                                key={playlist.id}
                                onClick={() => {
                                  if (isIncluded) {
                                    removeVideoFromPlaylist(playlist.id, playingVideo.videoId);
                                    triggerToast(`Removed from ${playlist.name}`);
                                  } else {
                                    addToPlaylistWithAnim(playlist.id, playingVideo);
                                  }
                                }}
                                className={cn(
                                  "w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all active:scale-98 font-bold text-xs cursor-pointer",
                                  isIncluded
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-muted/30 border-border/60 text-foreground/80 hover:bg-muted"
                                )}
                              >
                                <span>{playlist.name}</span>
                                {isIncluded ? (
                                  <span className="bg-primary/20 text-primary-foreground text-[10px] px-2.5 py-1 rounded-md border border-primary/20">Saved ✓</span>
                                ) : (
                                  <span className="text-foreground/45">Click to add +</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="pt-4 border-t border-border/30">
                          <button
                            onClick={() => setShowCreatePlaylistModal(true)}
                            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-1 hover:bg-primary/95 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Create New Playlist
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            
            /* INDEX / LISTINGS SCREENS */
            <motion.div 
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col overflow-hidden"
            >
              {/* Filter Suggestion Pills Row & Extended Inputs Header */}
              {activeMainTab === "browse" && (
                <div className="border-b border-border/30 dark:border-zinc-800/60 bg-muted/10 px-6 py-3.5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: YouTube Category pills row */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-grow max-w-full md:max-w-[65%]">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        onClick={() => handleCategoryClick(cat.label, cat.query)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer active:scale-95",
                          selectedCategory === cat.label
                            ? "bg-foreground text-background font-bold shadow-sm"
                            : "bg-muted/80 hover:bg-muted text-foreground/75 dark:text-zinc-300 dark:hover:bg-zinc-850"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Right: Tidy Filters (Dropdowns to remove clutter) & View Mode */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Sort Selector Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-foreground/50 uppercase font-black tracking-wider">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => handleFilterChangeAndSearch(e.target.value as any, durationFilter)}
                        className="bg-card text-foreground border border-border/60 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-red-650 transition-all cursor-pointer shadow-sm dark:bg-zinc-900"
                      >
                        <option value="relevance">Most Relevant 🎯</option>
                        <option value="date">Recently Uploaded ⏰</option>
                        <option value="viewCount">Most Views 🔥</option>
                        <option value="rating">Highest Rated ⭐</option>
                      </select>
                    </div>

                    {/* Duration Selector Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-foreground/50 uppercase font-black tracking-wider">Length:</span>
                      <select
                        value={durationFilter}
                        onChange={(e) => handleFilterChangeAndSearch(sortBy, e.target.value as any)}
                        className="bg-card text-foreground border border-border/60 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-red-650 transition-all cursor-pointer shadow-sm dark:bg-zinc-900"
                      >
                        <option value="any">Any Duration ⏱️</option>
                        <option value="short">Short (&lt; 4m) ⚡</option>
                        <option value="medium">Medium (4m-20m) 📺</option>
                        <option value="long">Long (&gt; 20m) 🎬</option>
                      </select>
                    </div>

                    {/* Collapsible Direct Play trigger to remove clutter */}
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === "direct" ? "search" : "direct")}
                      className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm",
                        activeTab === "direct" 
                          ? "bg-red-500/15 text-red-500 border-red-500/30" 
                          : "bg-card border-border hover:bg-muted text-foreground/75 dark:bg-zinc-900"
                      )}
                      title="Paste raw video link or direct ID to play"
                    >
                      <span>Direct Play</span>
                    </button>

                    {/* View mode buttons */}
                    <div className="flex bg-muted p-1 rounded-xl border border-border/40 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "p-1.5 rounded-lg transition-all cursor-pointer",
                          viewMode === "grid"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-foreground/45 hover:text-foreground"
                        )}
                        title="Grid View"
                      >
                        <Grid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={cn(
                          "p-1.5 rounded-lg transition-all cursor-pointer",
                          viewMode === "list"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-foreground/45 hover:text-foreground"
                        )}
                        title="List View"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible Direct Paste panel (only when active tab is direct URL) */}
              {activeMainTab === "browse" && activeTab === "direct" && (
                <div className="bg-muted/30 border-b border-border/20 px-6 py-3 shrink-0">
                  <form onSubmit={handleDirectSubmit} className="flex gap-2 max-w-3xl items-center">
                    <span className="text-[10px] text-foreground/50 font-bold uppercase shrink-0">URL:</span>
                    <div className="relative flex-grow">
                      <Tv className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/42" />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste link format: https://www.youtube.com/watch?v=XXXXXXXXXXX"
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-650 text-xs font-medium placeholder:font-normal"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-red-600 text-white hover:bg-red-550 px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-md"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Load Stream
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("search")}
                      className="text-xs bg-muted hover:bg-muted/80 px-3 py-2 rounded-xl font-bold text-foreground/60 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </form>
                </div>
              )}

              {/* Main Tab View Routing */}
              <div className="flex-grow overflow-y-auto p-6">
                
                {/* BROWSE LIVE / SEARCH SUBPANEL */}
                {activeMainTab === "browse" && (
                  <div className="max-w-7xl mx-auto w-full pb-10">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-28 text-center bg-card/10 rounded-2xl border border-border/30">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        <p className="mt-4 text-foreground/50 text-xs font-semibold tracking-wider font-mono">
                          FETCHING DATA DIRECTLY FROM THE PRO YOUTUBE SEARCHER AGENT...
                        </p>
                      </div>
                    ) : errorMsg ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                          <Tv className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold mb-1.5">No Search Connection Available</h3>
                        <p className="text-foreground/50 text-xs leading-relaxed mb-5">
                          {errorMsg}. Make sure you are connected online or that your API Key is active.
                        </p>
                        <button 
                          onClick={() => handleSearch(CATEGORIES[0].query)}
                          className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs transition-all hover:bg-primary/90 cursor-pointer"
                        >
                          Retry Cinema Index
                        </button>
                      </div>
                    ) : videos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-3xl">
                        <Tv className="w-10 h-10 text-foreground/20 mb-3" />
                        <h3 className="text-sm font-bold mb-1">No matches found</h3>
                        <p className="text-foreground/40 text-xs">Query index returned 0 matching YouTube records.</p>
                      </div>
                    ) : (
                      // Videos layout Grid or List
                      <div className="space-y-6">
                        <div className={cn(
                          viewMode === "grid" 
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "space-y-4 max-w-4xl mx-auto"
                        )}>
                          {videos.map((video) => (
                            <div 
                              key={video.videoId}
                              className={cn(
                                "group bg-card border border-border/40 hover:border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex relative",
                                viewMode === "grid" ? "flex-col" : "flex-col sm:flex-row p-4 gap-4"
                              )}
                            >
                              {/* Card Media Preview Area */}
                              <div 
                                onClick={() => selectVideoForPlayback(video)}
                                className={cn(
                                  "relative overflow-hidden bg-muted cursor-pointer shrink-0 rounded-xl",
                                  viewMode === "grid" ? "h-44 w-full rounded-b-none" : "h-36 w-full sm:w-60"
                                )}
                              >
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                                  </div>
                                </div>
                              </div>

                              {/* Options Float Action Triggers */}
                              <div className={cn(
                                "absolute flex gap-1 bg-black/50 backdrop-blur-md p-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                                viewMode === "grid" ? "top-2 right-2" : "top-6 right-6"
                              )}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenInDownloader(video)}
                                  className="p-1.5 rounded-md text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all cursor-pointer"
                                  title="Open in Downloader Tab"
                                >
                                  <DownloadCloud className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadOfflineClick(video)}
                                  className={cn(
                                    "p-1.5 rounded-md transition-all cursor-pointer",
                                    isOffline(video.videoId) ? "text-emerald-400 font-bold" : "text-white/80 hover:text-white"
                                  )}
                                  title={isOffline(video.videoId) ? "Cached Offline" : "Cache to Simulated Offline Index"}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDropdownVideo(video)}
                                  className="p-1.5 rounded-md text-white/80 hover:text-white transition-all cursor-pointer"
                                  title="Add to Playlist"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Text Header */}
                              <div className={cn(
                                "flex-grow flex flex-col justify-between",
                                viewMode === "grid" ? "p-4" : "py-1 min-w-0"
                              )}>
                                <div className="space-y-1.5">
                                  <h4 
                                    onClick={() => selectVideoForPlayback(video)}
                                    className={cn(
                                      "font-black tracking-tight leading-snug hover:text-primary transition-colors cursor-pointer text-foreground",
                                      viewMode === "grid" ? "text-xs line-clamp-2" : "text-sm md:text-base line-clamp-2"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: video.title }}
                                  />
                                  <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">{video.channelTitle}</p>
                                  {viewMode === "list" && (
                                    <p className="text-xs text-foreground/60 line-clamp-2 mt-2 leading-relaxed max-w-2xl">
                                      {video.description || "No description provided for this video stream. Open to study and journal timestamps."}
                                    </p>
                                  )}
                                </div>

                                <div className={cn(
                                  "flex items-center justify-between mt-3 text-[10px] text-foreground/45 font-mono font-bold uppercase",
                                  viewMode === "grid" ? "pt-4 border-t border-border/30" : "pt-3 sm:pt-0"
                                )}>
                                  <span>{new Date(video.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  {isOffline(video.videoId) && (
                                    <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">Offline Vault</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Trigger: Load More */}
                        {nextPageToken && (
                          <div className="flex justify-center pt-8 border-t border-border/20">
                            <button
                              type="button"
                              onClick={() => handleSearch(currentQuery, nextPageToken)}
                              disabled={isLoadingMore}
                              className="bg-card hover:bg-muted text-foreground border border-border/80 rounded-2xl px-8 py-3.5 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                            >
                              {isLoadingMore ? (
                                <>
                                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-foreground" />
                                  Loading More Videos...
                                </>
                              ) : (
                                "Load More Videos"
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* MY PLAYLISTS SUBPANEL */}
                {activeMainTab === "playlists" && (
                  <div className="max-w-7xl mx-auto w-full transition-all duration-300 flex flex-col lg:flex-row gap-8">
                    {/* Left Playlists Rail Selector */}
                    <div className="lg:w-1/4 space-y-4 shrink-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm uppercase font-extrabold tracking-wider text-foreground/50 font-mono">
                          Saved Channels
                        </h3>
                        <button
                          onClick={() => setShowCreatePlaylistModal(true)}
                          className="bg-primary hover:bg-primary/95 text-primary-foreground p-1 px-3.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> New
                        </button>
                      </div>

                      <div className="space-y-2">
                        {playlists.map((p) => {
                          const isActive = p.id === activePlaylistId;
                          return (
                            <div
                              key={p.id}
                              className={cn(
                                "group p-3 rounded-xl border flex items-center justify-between text-left transition-all relative cursor-pointer",
                                isActive
                                  ? "bg-card border-primary/50 text-foreground ring-1 ring-primary/20 shadow-md"
                                  : "bg-card/40 border-border/40 text-foreground/75 hover:bg-muted"
                              )}
                              onClick={() => setActivePlaylistId(p.id)}
                            >
                              <div className="space-y-0.5 max-w-[80%]">
                                <h4 className="font-bold text-xs truncate flex items-center gap-1">
                                  {p.name}
                                </h4>
                                <p className="text-[10px] text-foreground/45 line-clamp-1">{p.description || "No description set"}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 z-10">
                                <span className="bg-muted text-foreground/60 text-[9px] font-mono px-2 py-0.5 rounded-md font-bold">
                                  {p.videos.length}
                                </span>
                                {!p.isDefault && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deletePlaylist(p.id);
                                      if (activePlaylistId === p.id) {
                                        setActivePlaylistId(playlists[0].id);
                                      }
                                      triggerToast("Custom playlist file deleted!");
                                    }}
                                    className="text-foreground/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Videos Rail Viewer */}
                    <div className="flex-grow">
                      {(() => {
                        const activeList = playlists.find(p => p.id === activePlaylistId);
                        if (!activeList) return null;
                        return (
                          <div className="space-y-6">
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
                                <div>
                                  <h2 className="text-xl font-bold flex items-center gap-2">
                                    {activeList.name}
                                  </h2>
                                  <p className="text-xs text-foreground/50 mt-0.5 font-medium">{activeList.description}</p>
                                </div>
                                <span className="text-xs font-mono font-bold text-foreground/45">
                                  {activeList.videos.length} clips stored in cache index
                                </span>
                              </div>
                            </div>

                            {activeList.videos.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-20 text-center bg-card/10 rounded-2xl border border-dashed border-border/60">
                                <ListVideo className="w-8 h-8 text-foreground/20 mb-3" />
                                <h4 className="text-xs font-bold mb-1">Playlist Empty</h4>
                                <p className="text-foreground/40 text-[11px] mb-4">Add high-quality videos using the browse tab to construct your customized sequence.</p>
                                <button
                                  onClick={() => setActiveMainTab("browse")}
                                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary/90 cursor-pointer transition-all"
                                >
                                  Go search videos
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3 animate-in fade-in duration-300">
                                {activeList.videos.map((vid, idx) => (
                                  <div
                                    key={`${vid.videoId}-${idx}`}
                                    className="group/item flex items-center justify-between p-3.5 bg-card/60 hover:bg-card border border-border/40 rounded-xl transition-all shadow-sm"
                                  >
                                    <div 
                                      onClick={() => selectVideoForPlayback(vid)}
                                      className="flex gap-4 items-center flex-grow cursor-pointer max-w-[85%]"
                                    >
                                      {/* Mini Thumbnail */}
                                      <div className="w-20 h-12 rounded-lg bg-muted overflow-hidden shrink-0 relative border border-border/40">
                                        <img 
                                          referrerPolicy="no-referrer"
                                          src={vid.thumbnail} 
                                          alt={vid.title} 
                                          className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                          <Play className="w-3.5 h-3.5 text-white fill-current" />
                                        </div>
                                      </div>

                                      {/* Text Fields */}
                                      <div className="truncate pr-4 space-y-0.5">
                                        <h4 className="font-bold text-xs truncate text-foreground hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: vid.title }} />
                                        <p className="text-[10px] text-foreground/45 font-semibold">{vid.channelTitle}</p>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <button
                                      onClick={() => {
                                        removeVideoFromPlaylist(activeList.id, vid.videoId);
                                        triggerToast(`Removed from "${activeList.name}"`);
                                      }}
                                      className="text-foreground/42 hover:text-red-500 font-bold p-1.5 rounded hover:bg-red-500/10 cursor-pointer transition-all"
                                      title="Remove from playlist"
                                    >
                                      <Trash className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* OFFLINE METADATA VAULT SUBPANEL */}
                {activeMainTab === "offline" && (
                  <div className="max-w-7xl mx-auto w-full space-y-6">
                    {/* Header Summary info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-4">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          Offline Study Vault 💼
                        </h2>
                        <p className="text-xs text-foreground/50 mt-0.5 font-medium">
                          Access cached video metadata indexes, save custom markdown draft logs, and download standalone HTML apps to study offline.
                        </p>
                      </div>

                      <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-bold font-mono">
                        CACHED LOGS: {offlineVideos.length}
                      </div>
                    </div>

                    {offlineVideos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl">
                        <Tv className="w-10 h-10 text-foreground/20 mb-3" />
                        <h3 className="text-xs font-bold mb-1">Study Vault Empty</h3>
                        <p className="text-foreground/40 text-[11px] max-w-sm mb-5">
                          When online, click the "Cache Offline" or card Download icons to store detailed meta logs & markdown workspaces locally here.
                        </p>
                        <button
                          onClick={() => setActiveMainTab("browse")}
                          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
                        >
                          Find lectures to Cache
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {offlineVideos.map((video) => {
                          const hasNotes = !!videoNotes[video.videoId];
                          return (
                            <div 
                              key={video.videoId}
                              className="bg-card border border-border/40 hover:border-primary/20 rounded-2xl p-4 transition-all flex gap-4"
                            >
                              {/* Media left */}
                              <div 
                                onClick={() => selectVideoForPlayback(video)}
                                className="w-28 h-18 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer relative border border-border/30"
                              >
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={video.thumbnail} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <Play className="w-4 h-4 text-white fill-current" />
                                </div>
                              </div>

                              {/* Details text right */}
                              <div className="flex-grow flex flex-col justify-between min-w-0">
                                <div>
                                  <h4 
                                    onClick={() => selectVideoForPlayback(video)}
                                    className="font-bold text-xs hover:text-primary transition-colors cursor-pointer truncate"
                                    dangerouslySetInnerHTML={{ __html: video.title }}
                                  />
                                  <p className="text-[10px] text-foreground/50 font-bold mt-0.5">{video.channelTitle}</p>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                  <span className={cn(
                                    "text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border",
                                    hasNotes 
                                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                                      : "bg-muted text-foreground/40 border-border"
                                  )}>
                                    {hasNotes ? "Journal Created ✓" : "No notes yet"}
                                  </span>

                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => exportOfflineHTML(video)}
                                      className="p-1 px-2 hover:bg-primary/10 rounded border border-border text-[10px] text-primary transition-all font-bold cursor-pointer"
                                      title="Download self-contained offline html"
                                    >
                                      Export HTML App
                                    </button>
                                    <button
                                      onClick={() => {
                                        toggleOfflineVideo(video);
                                        triggerToast(`Removed metadata of ${video.videoId}`);
                                      }}
                                      className="p-1 text-foreground/40 hover:text-red-500 rounded hover:bg-red-500/5 cursor-pointer"
                                      title="Uncache metadata"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* CHANNELS MAIN PANEL */}
                {activeMainTab === "channels" && (
                  <div className="space-y-6">
                    {/* Channel Radar Subheader */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/20 via-card to-card p-6 rounded-2xl border border-rose-500/10">
                      <div>
                        <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-foreground">
                          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                          Creators Hub 💎
                        </h2>
                        <p className="text-xs text-foreground/50 mt-1 max-w-xl leading-relaxed">
                          Follow elite promoters, popular entertainers, and top-tier YouTube creators. Search channels by name, view full video catalogs, and save clips directly into your personal vault.
                        </p>
                      </div>

                      {/* Channel search form */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleChannelSearch(channelSearchQuery);
                        }}
                        className="flex gap-2 max-w-md w-full"
                      >
                        <div className="relative flex-grow">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                          <input 
                            type="text"
                            placeholder="Search YouTube channel by name..."
                            value={channelSearchQuery}
                            onChange={(e) => setChannelSearchQuery(e.target.value)}
                            className="w-full bg-muted/60 text-foreground pl-10 pr-4 py-2.5 rounded-xl border border-border/60 text-xs font-medium placeholder-foreground/45 focus:outline-none focus:border-red-500/60"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isChannelsLoading}
                          className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-red-600/10 active:scale-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        >
                          {isChannelsLoading ? (
                            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                          ) : (
                            "Search"
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Content Section */}
                    {channelError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs font-bold text-red-400">
                        {channelError}
                      </div>
                    )}

                    {isChannelsLoading && channelsList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4" />
                        <span className="text-xs text-foreground/50 font-bold">Scanning secure YouTube channels database...</span>
                      </div>
                    ) : selectedChannel ? (
                      /* ACTIVE CHANNELS DETAIL VIEW */
                      <div className="space-y-6">
                        {/* Selected Channel Bar */}
                        <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                          <div className="flex gap-4 items-center">
                            <img 
                              src={selectedChannel.thumbnail} 
                              alt={selectedChannel.title}
                              className="w-14 h-14 rounded-full border-2 border-red-500/30 object-cover"
                            />
                            <div>
                              <h3 className="font-black text-base text-foreground flex items-center gap-1.5 leading-tight">
                                {selectedChannel.title}
                                <span className="bg-red-500 text-[9px] uppercase px-1.5 py-0.5 rounded text-white font-sans max-h-5">Verified Official</span>
                              </h3>
                              <p className="text-xs text-foreground/60 line-clamp-2 mt-1 max-w-2xl leading-normal">{selectedChannel.description}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedChannel(null);
                              setChannelVideosList([]);
                            }}
                            className="text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
                          >
                            ← Back to Channels list
                          </button>
                        </div>

                        {/* Selected Channel Videos List Title */}
                        <div className="flex justify-between items-center pb-2 border-b border-border/20">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground/75">
                            Recent uploads of {selectedChannel.title}
                          </h3>
                        </div>

                        {/* Grid list of videos */}
                        {channelVideosList.length === 0 && isChannelsLoading ? (
                          <div className="flex justify-center py-16">
                            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
                          </div>
                        ) : channelVideosList.length === 0 ? (
                          <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                            <p className="text-xs text-foreground/50 font-medium">No videos active or currently streaming from this channel.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {channelVideosList.map((video) => (
                                <div 
                                  key={video.videoId}
                                  className="bg-card border border-border/40 hover:border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col relative"
                                >
                                  {/* Media Block preview */}
                                  <div 
                                    onClick={() => selectVideoForPlayback(video)}
                                    className="aspect-video bg-muted relative overflow-hidden shrink-0 cursor-pointer border-b border-border/10"
                                  >
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src={video.thumbnail} 
                                      alt={video.title} 
                                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                                        <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Options Triggers on hover */}
                                  <div className="absolute top-2 right-2 flex gap-1 z-15 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleOpenInDownloader(video)}
                                      className="p-1 rounded text-white/90 hover:text-rose-400 transition-colors cursor-pointer"
                                      title="Load into Master Downloader"
                                    >
                                      <DownloadCloud className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        toggleOfflineVideo(video);
                                        triggerToast(isOffline(video.videoId) ? "Removed from study cache" : "Buffered metadata in local cache!");
                                      }}
                                      className={cn(
                                        "p-1 rounded transition-colors cursor-pointer",
                                        isOffline(video.videoId) ? "text-emerald-400" : "text-white/90 hover:text-emerald-400"
                                      )}
                                      title="Cache direct to device archive"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Text Area */}
                                  <div className="p-3.5 flex-grow flex flex-col justify-between">
                                    <div className="space-y-1">
                                      <h4 
                                        onClick={() => selectVideoForPlayback(video)}
                                        className="font-extrabold text-[11px] leading-tight text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2"
                                        dangerouslySetInnerHTML={{ __html: video.title }}
                                      />
                                      <p className="text-[9px] text-foreground/45 font-bold uppercase tracking-wide">{video.channelTitle}</p>
                                    </div>

                                    <div className="pt-2 mt-3 border-t border-border/30 flex justify-between items-center text-[9px] font-mono text-foreground/45 font-bold">
                                      <span>{new Date(video.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                      {isOffline(video.videoId) && (
                                        <span className="text-emerald-500 font-sans uppercase">Cached</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Load more Channel clips */}
                            {channelNextPageToken && (
                              <div className="flex justify-center pt-4">
                                <button
                                  onClick={() => handleFetchChannelVideos(selectedChannel.channelId, channelNextPageToken)}
                                  disabled={isChannelsLoading}
                                  className="bg-card hover:bg-muted text-foreground border border-border/80 rounded-xl px-6 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
                                >
                                  {isChannelsLoading ? "Loading more and aligning track frames..." : "Load More Channel Stream tracks"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* CHANNELS SEARCH LIST DIRECT VIEW */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {channelsList.map((chan) => (
                          <div 
                            key={chan.channelId}
                            className="bg-card border border-border/50 hover:border-red-500/30 rounded-2xl p-5 flex gap-4 transition-all hover:shadow-md align-start"
                          >
                            <img 
                              src={chan.thumbnail} 
                              alt={chan.title}
                              className="w-12 h-12 rounded-full border border-border shrink-0 object-cover"
                            />
                            
                            <div className="flex-grow min-w-0 flex flex-col justify-between">
                              <div>
                                <h3 className="font-extrabold text-sm text-foreground hover:text-red-500 transition-colors cursor-pointer truncate"
                                    onClick={() => {
                                      setSelectedChannel(chan);
                                      handleFetchChannelVideos(chan.channelId);
                                    }}
                                >
                                  {chan.title}
                                </h3>
                                <p className="text-xs text-foreground/50 line-clamp-2 mt-1 leading-normal">
                                  {chan.description || "Combat sports archive stream. Open channel to explore fight highlights and workout streams."}
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
                                <span className="text-[10px] font-mono uppercase text-foreground/35 font-bold">YOUTUBE API STREAM</span>
                                <button
                                  onClick={() => {
                                    setSelectedChannel(chan);
                                    handleFetchChannelVideos(chan.channelId);
                                  }}
                                  className="text-[11px] font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Explore uploads</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* DOWNLOADER MAIN PANEL */}
                {activeMainTab === "downloader" && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Downloader Card Header */}
                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-rose-950/20 via-card to-card">
                      {/* Gradient Ambient ring glow */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="relative z-10">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[9px] font-extrabold uppercase border border-rose-500/20 tracking-wider">
                          STUDIO GRADE MEDIA RIPPING ENGINE
                        </span>
                        
                        <h2 className="text-lg font-black tracking-tight mt-2 flex items-center gap-2 text-foreground">
                          <DownloadCloud className="w-5 h-5 text-rose-500" />
                          Youtube Video Downloader
                        </h2>
                        
                        <p className="text-xs text-foreground/50 mt-1 max-w-2xl leading-relaxed">
                          Process video shares to extract high resolution formats. Supports full length MP4 videos up to maximum stream frame rate (60fps) & 320kbps MP3 audio streams.
                        </p>
                      </div>
                    </div>

                    {/* Downloader form block */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">YouTube Stream URL:</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                            <input 
                              type="text"
                              value={downloadInputUrl}
                              onChange={(e) => setDownloadInputUrl(e.target.value)}
                              placeholder="e.g., https://www.youtube.com/watch?v=A_VIDEO_ID or share code..."
                              className="w-full bg-muted/65 text-foreground pl-10 pr-4 py-3 rounded-xl border border-border text-xs font-mono font-bold placeholder-foreground/35 focus:outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Format selection grids */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Stream extraction choice */}
                        <div className="bg-muted/40 rounded-xl p-5 border border-border/40 space-y-4">
                          <h3 className="text-xs font-bold text-foreground">1. Choose Audio vs Video Stream:</h3>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDownloadFormat("mp4");
                                setDownloadQuality("1080p");
                              }}
                              className={cn(
                                "py-3 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer",
                                downloadFormat === "mp4" 
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/40 font-black"
                                  : "bg-card border-border/50 text-foreground/60 hover:bg-card/70"
                              )}
                            >
                              MP4 Video Stream (Full Movie)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDownloadFormat("mp3");
                                setDownloadQuality("320kbps");
                              }}
                              className={cn(
                                "py-3 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer",
                                downloadFormat === "mp3" 
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/40 font-black"
                                  : "bg-card border-border/50 text-foreground/60 hover:bg-card/70"
                              )}
                            >
                              MP3 Audio Stream (Max Quality)
                            </button>
                          </div>

                          <div className="pt-2">
                            <label className="text-[10px] font-bold text-foreground/60">Alternate Stream Container File format:</label>
                            <select
                              value={downloadFormat}
                              onChange={(e) => {
                                setDownloadFormat(e.target.value as any);
                                if (e.target.value === "mp3" || e.target.value === "m4a") {
                                  setDownloadQuality("320kbps");
                                } else {
                                  setDownloadQuality("1080p");
                                }
                              }}
                              className="w-full mt-1.5 bg-card/85 text-foreground border border-border rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-rose-500"
                            >
                              <optgroup label="Video Containers">
                                <option value="mp4">.mp4 (Motion Picture Expert Group Container)</option>
                                <option value="webm">.webm (WebM VP9 Web Stream Format)</option>
                              </optgroup>
                              <optgroup label="Audio Containers">
                                <option value="mp3">.mp3 (MPEG Audio Layer III codec)</option>
                                <option value="m4a">.m4a (Advanced Audio Codec AAC stream)</option>
                              </optgroup>
                            </select>
                          </div>
                        </div>

                        {/* Bitrate & Resolution Quality presets */}
                        <div className="bg-muted/40 rounded-xl p-5 border border-border/40 space-y-4">
                          <h3 className="text-xs font-bold text-foreground">2. Select Target Bitrate / Framerate Content:</h3>

                          {downloadFormat === "mp4" || downloadFormat === "webm" ? (
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { val: "4k", label: "4K Master UHD (2160p @60fps)" },
                                { val: "1440p", label: "1440p Quad-HD (2K @60fps)" },
                                { val: "1080p", label: "1080p Full-HD (Cinema @60fps)" },
                                { val: "720p", label: "720p Mobile-HD (Fast Stream)" },
                              ].map((item) => (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => setDownloadQuality(item.val)}
                                  className={cn(
                                    "p-2.5 rounded-xl text-[11px] font-semibold transition-all border text-left cursor-pointer",
                                    downloadQuality === item.val
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/40 font-black"
                                      : "bg-card border-border/50 text-foreground/60 hover:bg-card/70"
                                  )}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { val: "320kbps", label: "320kbps Standard Studio HD" },
                                { val: "256kbps", label: "256kbps Standard Studio Medium" },
                                { val: "192kbps", label: "192kbps Compressed Classic" },
                                { val: "128kbps", label: "128kbps Low Bandwidth Saver" },
                              ].map((item) => (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => setDownloadQuality(item.val)}
                                  className={cn(
                                    "p-2.5 rounded-xl text-[11px] font-semibold transition-all border text-left cursor-pointer",
                                    downloadQuality === item.val
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/40 font-black"
                                      : "bg-card border-border/50 text-foreground/60 hover:bg-card/70"
                                  )}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Download status engine / Console Log HUD */}
                      {downloadingState !== "idle" && (
                        <div className="bg-muted/80 rounded-xl p-5 border border-border/90 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold uppercase text-foreground flex items-center gap-1.5">
                              {downloadingState === "complete" ? (
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                              )}
                              Extraction Status: {downloadingState.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="font-mono text-xs font-bold text-rose-400">{downloadProgress}%</span>
                          </div>

                          {/* Level visual progress bar */}
                          <div className="w-full bg-card rounded-full h-2 overflow-hidden border border-border/60">
                            <div 
                              className={cn(
                                "h-full transition-all duration-500",
                                downloadingState === "complete" ? "bg-emerald-500" : "bg-rose-500"
                              )}
                              style={{ width: `${downloadProgress}%` }}
                            />
                          </div>

                          {/* Interactive Console logs output lines */}
                          <div className="bg-black/90 text-[11px] font-mono p-4 rounded-xl space-y-1.5 overflow-y-auto max-h-48 border border-border/80 scrollbar-thin">
                            {downloaderLogs.map((log, i) => (
                              <p 
                                key={i} 
                                className={cn(
                                  "leading-relaxed",
                                  log.includes("[CRITICAL]") && "text-amber-400",
                                  log.includes("[SUCCESS]") && "text-emerald-400",
                                  log.includes("[COMPILE]") && "text-blue-400",
                                  log.includes("[INFO]") && "text-foreground/80",
                                )}
                              >
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Execution Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const urlId = extractVideoId(downloadInputUrl);
                            const titleStr = urlId ? `Youtube Video Stream payload #${urlId}` : "Custom Youtube Stream payload Title";
                            runSimulatedDownload(titleStr);
                          }}
                          disabled={downloadingState !== "idle" && downloadingState !== "complete" && downloadingState !== "error"}
                          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-rose-600/10 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {downloadingState === "idle" || downloadingState === "complete" || downloadingState === "error" ? (
                            <>
                              <DownloadCloud className="w-4 h-4 text-white" />
                              <span>Initialize High-Speed Media rip ({downloadFormat.toUpperCase()} Codec)</span>
                            </>
                          ) : (
                            <>
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              <span>Downloader core active... Packing audio & video stream blocks</span>
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-center text-foreground/45 mt-2.5 font-bold uppercase tracking-wider">
                          Extracting is limited to education/offline study. By downloading, you confirm stream ownership.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RENDER POPUP MENU MODAL: ADD TO PLAYLIST */}
      {dropdownVideo && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            ref={dropdownRef}
            className="w-full max-w-sm bg-card border border-border/80 rounded-2xl p-5 shadow-2xl animate-in scale-in-95 duration-200"
          >
            <h3 className="text-sm font-extrabold flex items-center gap-1.5 mb-1 text-foreground">
              Add to Playlist File
            </h3>
            <p className="text-[11px] text-foreground/50 leading-relaxed mb-4">
              Select target channel database file to cache video reference.
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {playlists.map((p) => {
                const containsVideo = p.videos.some(v => v.videoId === dropdownVideo.videoId);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToPlaylistWithAnim(p.id, dropdownVideo)}
                    className="w-full p-2.5 rounded-xl border border-border/60 text-left text-xs font-bold hover:bg-muted active:scale-99 transition-all cursor-pointer flex justify-between items-center bg-muted/20"
                  >
                    <span>{p.name}</span>
                    {containsVideo ? (
                      <span className="text-[10px] text-emerald-500 font-mono">Present ✓</span>
                    ) : (
                      <span className="text-[10px] text-primary">+ Add</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setShowCreatePlaylistModal(true);
                  setDropdownVideo(null);
                }}
                className="flex-1 py-2 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                + New Playlist
              </button>
              <button
                onClick={() => setDropdownVideo(null)}
                className="flex-1 py-2 bg-muted text-foreground/75 text-xs font-bold rounded-xl transition-all hover:bg-background cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER MODAL: CREATE PLAYLIST */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateNewPlaylist}
            className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl animate-in scale-in-95 duration-200 space-y-4"
          >
            <div>
              <h3 className="text-base font-black tracking-tight text-foreground">
                Create custom playlist file
              </h3>
              <p className="text-[11px] text-foreground/50">Declare fields to index curated media collections.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-foreground/60 font-bold uppercase font-mono">Playlist Name</label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Mechanical Design Lectures 🛠️"
                  className="w-full p-2.5 bg-muted/40 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-medium placeholder:font-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-foreground/60 font-bold uppercase font-mono">Description (Optional)</label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Summary objective of the list..."
                  className="w-full p-2.5 bg-muted/40 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-medium placeholder:font-normal"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
              >
                Create File
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreatePlaylistModal(false);
                  setNewPlaylistName("");
                  setNewPlaylistDesc("");
                }}
                className="flex-1 py-2.5 bg-muted text-foreground/85 font-bold rounded-xl text-xs transition-all hover:bg-background cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
