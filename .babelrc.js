module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Inline plugin to handle import.meta transformation
      function () {
        return {
          visitor: {
            MetaProperty(path) {
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                // Replace import.meta with a safe object
                path.replaceWithSourceString(
                  '(typeof process !== "undefined" && process.env ? { env: process.env } : { env: {} })'
                );
              }
            },
            MemberExpression(path) {
              // Handle import.meta.env specifically
              if (
                path.node.object &&
                path.node.object.type === 'MetaProperty' &&
                path.node.object.meta.name === 'import' &&
                path.node.object.property.name === 'meta' &&
                path.node.property.name === 'env'
              ) {
                path.replaceWithSourceString(
                  '(typeof process !== "undefined" && process.env ? process.env : {})'
                );
              }
              // Handle import.meta.env.MODE
              if (
                path.node.object &&
                path.node.object.type === 'MemberExpression' &&
                path.node.object.object &&
                path.node.object.object.type === 'MetaProperty' &&
                path.node.object.object.meta.name === 'import' &&
                path.node.object.object.property.name === 'meta' &&
                path.node.object.property.name === 'env' &&
                path.node.property.name === 'MODE'
              ) {
                path.replaceWithSourceString(
                  '(typeof process !== "undefined" && process.env && process.env.NODE_ENV ? process.env.NODE_ENV : "development")'
                );
              }
            },
          },
        };
      },
    ],
  };
};