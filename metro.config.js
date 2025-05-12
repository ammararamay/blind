const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      assetExts: [...assetExts, 'tflite'], // Treat .tflite as an asset
      sourceExts: [...sourceExts.filter(ext => ext !== 'tflite')], // Ensure it's not treated as a source file
    },
  };
})();
