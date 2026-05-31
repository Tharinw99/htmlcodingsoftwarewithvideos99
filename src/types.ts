export interface HtmlSnippet {
  id: string;
  name: string;
  coverUrl: string;
  content: string;
  createdAt: number;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  videos: YouTubeVideo[];
  createdAt: number;
}
