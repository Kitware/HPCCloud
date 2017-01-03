# Tools

Tools are external . They are shown from the `simulation/view` page with this line:

```js
const ChildComponent = tools[viewName] ? tools[viewName].view : wfModule.components.ViewSimulation;
```

Tools are bundled in `src/tools/index.js` each tool has a `view` which is the primary view container for the tool and `providesToolbar` a boolean which prevents displaying a double toolbar. Feel free to add other properties to make your tool more accessible, such properties could include `requiresFullscreen` or `openInNewWindow`

## View container

While the tool itself does not need to be integrated with the Redux store, the container does. To pass the necessary information to your tool you'll  want to include the important information in the step metadata. We do this with the [`sessionId`](https://github.com/Kitware/HPCCloud/blob/master/src/workflows/pyfr/common/steps/Visualization/Start/index.js#L74-L86) for steps that use the Paraview Web Visualizer.

## Redux

It is not necessary for your tool to use Redux. However if it does you'll need to provide accessor methods to override which state it operates on, see the [Paraview Web Visualizer repository](https://github.com/Kitware/visualizer) for an example how to do this. You'll also need to combine the reducers with HPCCloud's reducers.