import CodeSaturn   from './code-saturn';
import NWChem       from './nwchem/nwchem-simput';
import NWChemExec   from './nwchem/nwchem-exec';
import PyFr         from './pyfr/pyfr-simput';
import PyFrExec     from './pyfr/pyfr-exec';
import Visualizer   from './visualizer';

const Workflows = {
  CodeSaturn,
  NWChem,
  NWChemExec,
  PyFr,
  PyFrExec,
  Visualizer,
};

export const workflowNames = Object.keys(Workflows).map(value => {
  const label = Workflows[value].name;
  return { value, label };
});

export default Workflows;
