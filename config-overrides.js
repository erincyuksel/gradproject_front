module.exports = function override(config, env) {
  console.log("override");
  let loaders = config.resolve;
  loaders.fallback = {
    http: require.resolve("stream-http"),
    stream: require.resolve("stream-browserify"),
    https: require.resolve("https-browserify"),
    zlib: require.resolve("browserify-zlib"),
    buffer: require.resolve("buffer"),
  };
  return config;
};
