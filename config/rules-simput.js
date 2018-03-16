module.exports = [
  {
    test: /\.js$/,
    include: /node_modules(\/|\\)simput(\/|\\)/,
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
