# === FIXME path to so/dylib ==================================================
plugin_path = '/Users/seb/Work/code/CMB/build/MoabReader/libvtkCmbMoabReaderPlugin.dylib'
lib_dir_path = '/Users/seb/Work/code/CMB/build/moab/lib'
# === FIXME path to so/dylib ==================================================

import os, sys
from paraview.simple import *

try:
    import argparse
except ImportError:
    # since  Python 2.6 and earlier don't have argparse, we simply provide
    # the source for the same as _argparse and we use it instead.
    import _argparse as argparse

# =============================================================================
# Main: Parse args and start server
# =============================================================================

if __name__ == "__main__":
    # Create argument parser
    parser = argparse.ArgumentParser(description="Mesh Generator")

    # Handle arguments
    parser.add_argument("--mesh", default=None, help="Exodus Mesh file to convert", dest="file")
    parser.add_argument("--output", default=None, help="VTK extracted face Mesh", dest="output")
    args = parser.parse_args()

    # Load plugin
    LoadPlugin(plugin_path, ns=globals())

    reader = CmbMoabSolidReader(FileName=args.file)
    reader.UpdatePipeline()

    SaveData(args.output, proxy=reader)
