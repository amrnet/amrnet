/*
  craco.config.js
  Override CRA config, fix deprecation warnings, and add fallbacks for Node modules.
*/
module.exports = {
  eslint: {
    enable: process.env.REACT_APP_ESLINT_ENABLE === 'true',
    mode: process.env.REACT_APP_ESLINT_ENABLE === 'true' ? 'extends' : 'file',
  },
  devServer: devServerConfig => {
    devServerConfig.onBeforeSetupMiddleware = undefined;
    devServerConfig.onAfterSetupMiddleware = undefined;
    return devServerConfig;
  },
  webpack: {
    configure: webpackConfig => {
      // Remove ModuleScopePlugin
      if (webpackConfig.resolve && Array.isArray(webpackConfig.resolve.plugins)) {
        const idx = webpackConfig.resolve.plugins.findIndex(
          p => p && p.constructor && p.constructor.name === 'ModuleScopePlugin',
        );
        if (idx !== -1) webpackConfig.resolve.plugins.splice(idx, 1);
      }

      // Add Node module fallbacks
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'), // fixed here
      };

      // Some node_modules (e.g. dompurify) ship source maps pointing at .ts
      // files that aren't included in their npm package, which webpack can
      // never resolve. Silence just that warning instead of disabling source
      // maps for the whole build.
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/,
      ];

      return webpackConfig;
    },
  },
};