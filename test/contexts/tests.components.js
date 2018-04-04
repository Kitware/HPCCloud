const context = require.context('../components', true, /\.js$/);
context.keys().forEach(context);
