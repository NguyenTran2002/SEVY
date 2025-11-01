const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/chat',
        createProxyMiddleware({
            target: 'http://python-backend:5000',
            changeOrigin: true,
        })
    );

    app.use(
        '/get_all_numbers',
        createProxyMiddleware({
            target: 'http://python-backend:5000',
            changeOrigin: true,
        })
    );

    app.use(
        '/get_sevy_educators_number',
        createProxyMiddleware({
            target: 'http://python-backend:5000',
            changeOrigin: true,
        })
    );

    app.use(
        '/get_sevy_ai_answers',
        createProxyMiddleware({
            target: 'http://python-backend:5000',
            changeOrigin: true,
        })
    );

    app.use(
        '/get_students_taught',
        createProxyMiddleware({
            target: 'http://python-backend:5000',
            changeOrigin: true,
        })
    );
};