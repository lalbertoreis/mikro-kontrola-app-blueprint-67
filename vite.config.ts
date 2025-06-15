
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Aggressively reduce the number of files being watched
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/.nyc_output/**',
        '**/logs/**',
        '**/*.log',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/.env*',
        '**/supabase/logs/**',
        '**/supabase/.temp/**',
        '**/supabase/functions/**',
        '**/supabase/migrations/**',
        '**/.lovable/**',
        '**/tmp/**',
        '**/temp/**'
      ],
      // Use polling instead of native file watching to reduce file descriptors
      usePolling: true,
      // Reduce polling interval to improve performance
      interval: 1000
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize dependency pre-bundling to reduce file watching
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'date-fns',
      'recharts'
    ],
    // Force pre-bundling of dependencies to reduce file watching
    force: true
  },
  // Reduce build warnings and improve performance
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings to reduce console noise
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        warn(warning);
      }
    }
  }
}));
