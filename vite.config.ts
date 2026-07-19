import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep the cryptographic / relay stack together; most apps don't need it.
          if (/\/src\/(lib\/crypto|lib\/concord|lib\/relay)\//.test(id)) {
            return 'crypto-stack';
          }

          // Group lazy-loaded apps so opening one app in a category downloads
          // a reasonable chunk without inflating the initial bundle.
          if (/\/src\/apps\/(?!AppRouter).*\.tsx$/.test(id)) {
            const name = path.basename(id, '.tsx');

            const system = ['FileManager', 'Terminal', 'TextEditor', 'Calculator', 'Settings', 'SystemMonitor', 'ArchiveManager', 'DocumentViewer'];
            if (system.includes(name)) return 'system-apps';

            const productivity = ['Calendar', 'Notes', 'Todo', 'Clock', 'Spreadsheet', 'Reminders', 'Contacts', 'PasswordManager', 'Whiteboard'];
            if (productivity.includes(name)) return 'productivity-apps';

            const internet = ['Browser', 'Email', 'Chat', 'Communities', 'Weather', 'RssReader', 'FtpClient', 'NetworkTools'];
            if (internet.includes(name)) return 'internet-apps';

            const media = ['MusicPlayer', 'VideoPlayer', 'ImageViewer', 'PhotoEditor', 'VoiceRecorder', 'ScreenRecorder', 'MediaConverter', 'ImageGallery'];
            if (media.includes(name)) return 'media-apps';

            const games = ['Minesweeper', 'Snake', 'Tetris', 'TicTacToe', 'Game2048', 'Sudoku', 'Chess', 'Memory', 'Pong', 'Solitaire', 'FlappyBird'];
            if (games.includes(name)) return 'games';

            // Heavy/slow dev tools get their own chunks to keep the shared dev-tools chunk small.
            if (name === 'CodeEditor') return 'code-editor';
            if (name === 'GitClient') return 'git-client';
            if (name === 'MarkdownPreview') return 'markdown-preview';
            if (name === 'RemoteSigner') return 'remote-signer';

            return 'dev-tools';
          }
        },
      },
    },
  },
});
