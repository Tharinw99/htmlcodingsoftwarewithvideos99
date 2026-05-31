import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HtmlSnippet, YouTubeVideo, Playlist } from './types';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  htmlSnippets: HtmlSnippet[];
  addHtmlSnippet: (snippet: Omit<HtmlSnippet, 'id' | 'createdAt'>) => void;
  removeHtmlSnippet: (id: string) => void;
  updateHtmlSnippet: (id: string, snippet: Partial<HtmlSnippet>) => void;

  // New Fields for Cinema YouTube Viewer
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => string;
  deletePlaylist: (id: string) => void;
  addVideoToPlaylist: (playlistId: string, video: YouTubeVideo) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;

  offlineVideos: YouTubeVideo[];
  toggleOfflineVideo: (video: YouTubeVideo) => void;
  isOffline: (videoId: string) => boolean;

  videoNotes: Record<string, string>;
  saveVideoNote: (videoId: string, note: string) => void;

  simulatedOfflineMode: boolean;
  setSimulatedOfflineMode: (offline: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),

      htmlSnippets: [],
      addHtmlSnippet: (snippet) =>
        set((state) => ({
          htmlSnippets: [
            {
              ...snippet,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
            ...state.htmlSnippets,
          ],
        })),
      removeHtmlSnippet: (id) =>
        set((state) => ({
          htmlSnippets: state.htmlSnippets.filter((item) => item.id !== id),
        })),
      updateHtmlSnippet: (id, updatedData) =>
        set((state) => ({
          htmlSnippets: state.htmlSnippets.map((item) => 
            item.id === id ? { ...item, ...updatedData } : item
          ),
        })),

      // YouTube Playlists Slice
      playlists: [
        {
          id: 'watch-later',
          name: 'Watch Later 🍿',
          description: 'Videos bookmarked for future viewing sessions',
          isDefault: true,
          videos: [],
          createdAt: Date.now()
        },
        {
          id: 'favorites',
          name: 'Favorites ❤️',
          description: 'Your premium collections and ultimate cinematic streams',
          isDefault: true,
          videos: [],
          createdAt: Date.now()
        }
      ],
      createPlaylist: (name, description) => {
        const id = crypto.randomUUID();
        set((state) => ({
          playlists: [
            ...state.playlists,
            {
              id,
              name,
              description,
              videos: [],
              createdAt: Date.now(),
            }
          ]
        }));
        return id;
      },
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id || p.isDefault)
      })),
      addVideoToPlaylist: (playlistId, video) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            // Avoid duplicate additions
            if (p.videos.some(v => v.videoId === video.videoId)) return p;
            return {
              ...p,
              videos: [...p.videos, video]
            };
          }
          return p;
        })
      })),
      removeVideoFromPlaylist: (playlistId, videoId) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            return {
              ...p,
              videos: p.videos.filter(v => v.videoId !== videoId)
            };
          }
          return p;
        })
      })),

      // YouTube Offline Videos Slice
      offlineVideos: [],
      toggleOfflineVideo: (video) => set((state) => {
        const index = state.offlineVideos.findIndex(v => v.videoId === video.videoId);
        if (index > -1) {
          return {
            offlineVideos: state.offlineVideos.filter(v => v.videoId !== video.videoId)
          };
        } else {
          return {
            offlineVideos: [...state.offlineVideos, video]
          };
        }
      }),
      isOffline: (videoId) => {
        return get().offlineVideos.some((v) => v.videoId === videoId);
      },

      // Video notes
      videoNotes: {},
      saveVideoNote: (videoId, note) => set((state) => ({
        videoNotes: {
          ...state.videoNotes,
          [videoId]: note
        }
      })),

      // Offline mode toggling
      simulatedOfflineMode: false,
      setSimulatedOfflineMode: (offline) => set({ simulatedOfflineMode: offline }),
    }),
    {
      name: 'media-vault-storage',
    }
  )
);

