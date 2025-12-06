/*
  craco.config.js
  This file is used to override the default Create React App configuration.
  We are using it here specifically to address a deprecation warning from
  webpack-dev-server that is triggered by react-scripts.
*/
module.exports = {
  eslint: {
    enable: process.env.REACT_APP_ESLINT_ENABLE === 'true',
    mode: process.env.REACT_APP_ESLINT_ENABLE === 'true' ? 'extends' : 'file',
  },
  devServer: devServerConfig => {
    /*
      The 'onBeforeSetupMiddleware' and 'onAfterSetupMiddleware' options are deprecated.
      By setting them to undefined, we prevent react-scripts from using them,
      which silences the warning without affecting the development server's functionality.
    */
    devServerConfig.onBeforeSetupMiddleware = undefined;
    devServerConfig.onAfterSetupMiddleware = undefined;
    return devServerConfig;
  },
  webpack: {
    configure: webpackConfig => {
      // Remove ModuleScopePlugin so imports that resolve to absolute paths
      // (for example react-refresh runtime injected by react-scripts) are allowed.
      if (webpackConfig.resolve && Array.isArray(webpackConfig.resolve.plugins)) {
        const idx = webpackConfig.resolve.plugins.findIndex(
          p => p && p.constructor && p.constructor.name === 'ModuleScopePlugin',
        );
        if (idx !== -1) webpackConfig.resolve.plugins.splice(idx, 1);
      }
      return webpackConfig;
    },
  },
};
