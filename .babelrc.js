module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Plugin to transform import.meta to compatible code
      function () {
        return {
          visitor: {
            MetaProperty(path) {
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                // Replace import.meta.env with process.env for React Native compatibility
                const parent = path.parent;
                if (parent.type === 'MemberExpression' && parent.property.name === 'env') {
                  path.parentPath.replaceWith({
                    type: 'LogicalExpression',
                    operator: '||',
                    left: {
                      type: 'MemberExpression',
                      object: { type: 'Identifier', name: 'process' },
                      property: { type: 'Identifier', name: 'env' }
                    },
                    right: {
                      type: 'ObjectExpression',
                      properties: []
                    }
                  });
                } else {
                  // Replace standalone import.meta with empty object
                  path.replaceWith({
                    type: 'ObjectExpression',
                    properties: []
                  });
                }
              }
            }
          }
        };
      }
    ],
  };
};