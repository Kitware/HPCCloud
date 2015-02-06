#!/bin/bash

export LD_LIBRARY_PATH=/Users/seb/Work/code/CMB/build/moab/lib
export DYLD_LIBRARY_PATH=/Users/seb/Work/code/CMB/build/moab/lib

/Users/seb/Work/code/ParaView/build/bin/pvpython /Users/seb/Work/code/CMB-Web/www/scripts/hydra-ne/pv_mesh_generator.py --mesh /Users/seb/Desktop/Reactors/simpleHex.exo --output /Users/seb/Desktop/hello.vtk
