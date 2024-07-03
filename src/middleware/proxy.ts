import { createProxyMiddleware } from "http-proxy-middleware";
import { Express } from "express";
export default (app: Express ) => {
    app.use('/auth',
        createProxyMiddleware({
            target: 'http://localhost:3000',
            changeOrigin: true,
        })
    )
}