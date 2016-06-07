// gathers the files to be tested, currently just redux.
var context = require.context('./redux', true, /\.js$/);
context.keys().forEach(context);
