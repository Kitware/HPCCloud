import NWChem             from './nwchem/nwchem-simput';
import NWChemExec         from './nwchem/nwchem-exec';
import NWChemNeb          from './nwchem/nwchem-neb';
import OpenFOAMTutorial   from './openfoam/tutorials';
import OpenFOAMWindTunnel from './openfoam/windtunnel';
import PyFr               from './pyfr';
import SparkMPI           from './spark-mpi';
import Visualizer         from './visualizer';

const Workflows = {
  NWChem,
  NWChemExec,
  NWChemNeb,
  OpenFOAMTutorial,
  OpenFOAMWindTunnel,
  PyFr,
  SparkMPI,
  Visualizer,
};

export const workflowNames = Object.keys(Workflows).map((value) => {
  const label = Workflows[value].name;
  return { value, label };
});

export default Workflows;
