// import CodeSaturn   from './code-saturn';
import PyFr         from './pyfr/pyfr-simput';
import PyFrExec     from './pyfr/pyfr-exec';
import Visualizer   from './visualizer';

const Workflows = {
  // CodeSaturn,
  PyFr,
  PyFrExec,
  Visualizer,
};

export const workflowNames = Object.keys(Workflows).map(value => {
  const label = Workflows[value].name;
  return { value, label };
});

export default Workflows;
