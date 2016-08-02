// redux/reducers/projects takes a workflows/index.js just for the workflow names
// however by requiring that file we require a ton of react components which we're
// not interested in testing here. So, we resolve 'workflows' to this file when testing.
module.exports.workflowNames = [
  {
    value: 'PyFr',
    label: 'PyFR',
  },
  {
    value: 'PyFrExec',
    label: 'PyFR (Runtime)',
  },
  {
    value: 'Visualizer',
    label: 'ParaViewWeb',
  },
];
