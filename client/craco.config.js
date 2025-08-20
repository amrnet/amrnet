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
};