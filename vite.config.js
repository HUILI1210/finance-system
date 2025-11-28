import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: '/finance-system/',
    server: {
        port: 5180,
        open: false,
        strictPort: true
    }
});
