const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/chat',
        createProxyMiddleware({
            target: 'http://python-backend:5000',
            changeOrigin: true,
        })
    );
};