module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'babel-plugin-transform-import-meta',
        {
          module: 'ES6'
        }
      ],
      // Additional plugin to handle any remaining import.meta cases
      function () {
        return {
          visitor: {
            MetaProperty(path) {
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                // Replace import.meta with process.env for React Native
                path.replaceWith({
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'ObjectProperty',
                      key: { type: 'Identifier', name: 'env' },
                      value: {
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
                      }
                    }
                  ]
                });
              }
            }
          }
        };
      }
    ],
  };
};