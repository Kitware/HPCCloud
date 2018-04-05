module.exports = [
  {
    test: /\.js$/,
    include: /node_modules(\/|\\)pvw-visualizer(\/|\\)/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: ['env', 'react'],
        },
      },
    ],
  },
];
