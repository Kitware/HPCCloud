var reduxContext = require.context('../redux', true, /\.js$/);
reduxContext.keys().forEach(reduxContext);
