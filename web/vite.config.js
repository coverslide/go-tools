
const TARGET = process.env.TARGET || "http://localhost:8080"

export default {
    server: {
        proxy: {
            "/api": {
                target: `${TARGET}`,
                changeOrigin: true,
            }
        }
    }
}