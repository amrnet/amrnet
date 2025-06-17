module.exports = {
    devServer: {
        // ...other options...
        // Remove this if present:
        // onAfterSetupMiddleware: function (devServer) {
        //   // your middleware code
        // },

        // Add this instead:
        setupMiddlewares: (middlewares, devServer) => {
            // your middleware code
            // Example:
            // devServer.app.use(/* your middleware */);

            return middlewares;
        },
    }
};