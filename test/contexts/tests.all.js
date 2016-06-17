var reduxContext = require.context('../redux', true, /\.js$/);
reduxContext.keys().forEach(reduxContext);

var componentContext = require.context('../components', true, /\.js$/);
componentContext.keys().forEach(componentContext);
