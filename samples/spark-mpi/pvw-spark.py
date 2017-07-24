# based on https://github.com/Kitware/spark-mpi-experimentation/blob/master/experimentations/14-spark-pipeline/pvw-spark.py
from __future__ import print_function
import os
import sys
import time
from datetime import datetime
import pyspark

from pyspark import SparkContext

from paraview import simple
import vtk
import numpy as np
import scipy.sparse as ss
from vtk.numpy_interface import dataset_adapter as dsa
from vtk.util import numpy_support
from vtk.vtkCommonCore import vtkIntArray

sc = SparkContext()

# -------------------------------------------------------------------------
# MPI configuration
# -------------------------------------------------------------------------

hostname = os.uname()[1]
hydra_proxy_port = os.getenv("HYDRA_PROXY_PORT")
pmi_port = hostname + ":" + hydra_proxy_port

# -------------------------------------------------------------------------
# Parallel configuration
# -------------------------------------------------------------------------

nbSparkPartition = int(os.environ["SPARK_SIZE"])
nbMPIPartition = int(os.environ["MPI_SIZE"])

# -------------------------------------------------------------------------
# Read Tiff file
# -------------------------------------------------------------------------

t0 = time.time()
print('### Start execution - %s' % str(datetime.now()))

filePath = '%s/data-convert/TiltSeries_NanoParticle_doi_10.1021-nl103400a' + \
           '.tif' % os.environ["SPARK_MPI_PATH"]
reader = simple.TIFFSeriesReader(FileNames=[filePath])
reader.UpdatePipeline()
imageData = reader.GetClientSideObject().GetOutputDataObject(0)
dataArray = imageData.GetPointData().GetScalars()
npArray = np.arange(dataArray.GetNumberOfTuples(), dtype=float)
for idx in range(dataArray.GetNumberOfTuples()):
    npArray[idx] = dataArray.GetTuple1(idx)

t1 = time.time()
print('### Tiff read - %s' % str(t1 - t0))
t0 = t1

# -------------------------------------------------------------------------
# Metadata extraction
# -------------------------------------------------------------------------

originalDimensions = imageData.GetDimensions()
sizeX = originalDimensions[0]
sizeY = originalDimensions[1]
sizeZ = originalDimensions[2]
sliceSize = sizeX * sizeY
globalMaxIndex = sizeX * sizeY * sizeZ

print('Dimensions: %d x %d x %d' % (sizeX, sizeY, sizeZ))

def _ijk(index):
    return [
        (index % sizeX),
        (index / sizeX % sizeY),
        int(index / sliceSize),
    ]

# -------------------------------------------------------------------------
# Partition handling
# -------------------------------------------------------------------------

sparkStepX = int(sizeX / nbSparkPartition)
sparkStepX_ = sizeX % nbSparkPartition

mpiStepX = int(sizeX / nbMPIPartition)
mpiStepX_ = sizeX % nbMPIPartition

# -------------------------------------------------------------------------

def getSparkSizeX(partitionId):
    if partitionId < sparkStepX_:
        return sparkStepX + 1
    return sparkStepX

def getSparkPartition(index):
    x = index % sizeX
    for i in range(nbSparkPartition):
        chunkSize = getSparkSizeX(i)
        if x < chunkSize:
            return i
        x -= chunkSize
    print('Error invalid mpi partition %d %d %d' % (index, sizeX, nbSparkPartition))
    return nbSparkPartition

# -------------------------------------------------------------------------

def getMPISizeX(partitionId):
    if partitionId < mpiStepX_:
        return mpiStepX + 1
    return mpiStepX

def getMPIPartition(index):
    x = index % sizeX
    for i in range(nbMPIPartition):
        chunkSize = getMPISizeX(i)
        if x < chunkSize:
            return i
        x -= chunkSize
    print('Error invalid mpi partition %d %d %d' % (index, sizeX, nbMPIPartition))
    return nbMPIPartition

# -----------------------------------------------------------------------------
# Helper: ParaViewWeb options
# -----------------------------------------------------------------------------

class Options(object):
    debug = False
    nosignalhandlers = True
    host = 'localhost'
    port = 9753
    timeout = 300
    content = '%s/runtime/visualizer/dist' % (os.environ["SPARK_MPI_PATH"])
    forceFlush = False
    sslKey = ''
    sslCert = ''
    ws = 'ws'
    lp = 'lp'
    hp = 'hp'
    nows = False
    nobws = False
    nolp = False
    fsEndpoints = ''
    uploadPath = None
    testScriptPath = ''
    baselineImgDir = ''
    useBrowser = 'nobrowser'
    tmpDirectory = '.'
    testImgFile = ''

# -----------------------------------------------------------------------------
# Helper: Image reconstruction
# -----------------------------------------------------------------------------

def parallelRay(Nside, pixelWidth, angles, Nray, rayWidth):
    # Suppress warning messages that pops up when dividing zeros
    np.seterr(all='ignore')
    Nproj = len(angles) # Number of projections

    # Ray coordinates at 0 degrees.
    offsets = np.linspace(-(Nray * 1.0 - 1) / 2,
                          (Nray * 1.0 - 1) / 2, Nray) * rayWidth
    # Intersection lines/grid Coordinates
    xgrid = np.linspace(-Nside * 0.5, Nside * 0.5, Nside + 1) * pixelWidth
    ygrid = np.linspace(-Nside * 0.5, Nside * 0.5, Nside + 1) * pixelWidth
    # Initialize vectors that contain matrix elements and corresponding
    # row/column numbers
    rows = np.zeros(2 * Nside * Nproj * Nray)
    cols = np.zeros(2 * Nside * Nproj * Nray)
    vals = np.zeros(2 * Nside * Nproj * Nray)
    idxend = 0

    for i in range(0, Nproj): # Loop over projection angles
        ang = angles[i] * np.pi / 180.
        # Points passed by rays at current angles
        xrayRotated = np.cos(ang) * offsets
        yrayRotated = np.sin(ang) * offsets
        xrayRotated[np.abs(xrayRotated) < 1e-8] = 0
        yrayRotated[np.abs(yrayRotated) < 1e-8] = 0

        a = -np.sin(ang)
        a = rmepsilon(a)
        b = np.cos(ang)
        b = rmepsilon(b)

        for j in range(0, Nray): # Loop rays in current projection
            #Ray: y = tx * x + intercept
            t_xgrid = (xgrid - xrayRotated[j]) / a
            y_xgrid = b * t_xgrid + yrayRotated[j]

            t_ygrid = (ygrid - yrayRotated[j]) / b
            x_ygrid = a * t_ygrid + xrayRotated[j]
            # Collect all points
            t_grid = np.append(t_xgrid, t_ygrid)
            xx = np.append(xgrid, x_ygrid)
            yy = np.append(y_xgrid, ygrid)
            # Sort the coordinates according to intersection time
            I = np.argsort(t_grid)
            xx = xx[I]
            yy = yy[I]

            # Get rid of points that are outside the image grid
            Ix = np.logical_and(xx >= -Nside / 2.0 * pixelWidth,
                                xx <= Nside / 2.0 * pixelWidth)
            Iy = np.logical_and(yy >= -Nside / 2.0 * pixelWidth,
                                yy <= Nside / 2.0 * pixelWidth)
            I = np.logical_and(Ix, Iy)
            xx = xx[I]
            yy = yy[I]

            # If the ray pass through the image grid
            if (xx.size != 0 and yy.size != 0):
                # Get rid of double counted points
                I = np.logical_and(np.abs(np.diff(xx)) <=
                                   1e-8, np.abs(np.diff(yy)) <= 1e-8)
                I2 = np.zeros(I.size + 1)
                I2[0:-1] = I
                xx = xx[np.logical_not(I2)]
                yy = yy[np.logical_not(I2)]

                # Calculate the length within the cell
                length = np.sqrt(np.diff(xx)**2 + np.diff(yy)**2)
                #Count number of cells the ray passes through
                numvals = length.size

                # Remove the rays that are on the boundary of the box in the
                # top or to the right of the image grid
                check1 = np.logical_and(b == 0, np.absolute(
                    yrayRotated[j] - Nside / 2 * pixelWidth) < 1e-15)
                check2 = np.logical_and(a == 0, np.absolute(
                    xrayRotated[j] - Nside / 2 * pixelWidth) < 1e-15)
                check = np.logical_not(np.logical_or(check1, check2))

                if np.logical_and(numvals > 0, check):
                    # Calculate corresponding indices in measurement matrix
                    # First, calculate the mid points coord. between two
                    # adjacent grid points
                    midpoints_x = rmepsilon(0.5 * (xx[0:-1] + xx[1:]))
                    midpoints_y = rmepsilon(0.5 * (yy[0:-1] + yy[1:]))
                    #Calculate the pixel index for mid points
                    pixelIndicex = \
                        (np.floor(Nside / 2.0 - midpoints_y / pixelWidth)) * \
                        Nside + (np.floor(midpoints_x /
                                          pixelWidth + Nside / 2.0))
                    # Create the indices to store the values to the measurement
                    # matrix
                    idxstart = idxend
                    idxend = idxstart + numvals
                    idx = np.arange(idxstart, idxend)
                    # Store row numbers, column numbers and values
                    rows[idx] = i * Nray + j
                    cols[idx] = pixelIndicex
                    vals[idx] = length
            else:
                print("Ray No. %d at %f degree is out of image grid!" %
                      (j + 1, angles[i]))

    # Truncate excess zeros.
    rows = rows[:idxend]
    cols = cols[:idxend]
    vals = vals[:idxend]
    A = ss.coo_matrix((vals, (rows, cols)), shape=(Nray * Nproj, Nside**2))
    return A

# -----------------------------------------------------------------------------

def rmepsilon(input):
    if (input.size > 1):
        input[np.abs(input) < 1e-10] = 0
    else:
        if np.abs(input) < 1e-10:
            input = 0
    return input

# -------------------------------------------------------------------------
# Spark reconstruction
# -------------------------------------------------------------------------

def reconstruct(partitionId, iterator):
    # Extract iOffset
    iOffset = 0
    for i in range(partitionId):
        iOffset += getSparkSizeX(i)

    # Copy data from iterator into data chunk
    t0 = time.time()

    dataChunk = np.empty([getSparkSizeX(partitionId), sizeY, sizeZ], dtype=float, order='F')
    for item in iterator:
        globalIndex = item[0]
        pixelValue = item[1]
        ijk = _ijk(globalIndex)
        ijk[0] -= iOffset
        dataChunk[ijk[0]][ijk[1]][ijk[2]] = pixelValue

    t1 = time.time()
    print('%d # Gather %s | ' % (partitionId, str(t1 - t0)))
    t0 = t1

    # Do reconstruction
    tiltSeries = dataChunk
    tiltAngles = range(-sizeZ + 1, sizeZ, 2) # Delta angle of 2
    (Nslice, Nray, Nproj) = tiltSeries.shape
    Niter = 1

    A = parallelRay(Nray, 1.0, tiltAngles, Nray, 1.0) # A is a sparse matrix
    recon = np.empty([Nslice, Nray, Nray], dtype=float, order='F')

    A = A.todense()

    (Nrow, Ncol) = A.shape
    rowInnerProduct = np.zeros(Nrow)
    row = np.zeros(Ncol)
    f = np.zeros(Ncol) # Placeholder for 2d image
    beta = 1.0

    # Calculate row inner product
    for j in range(Nrow):
        row[:] = A[j, ].copy()
        rowInnerProduct[j] = np.dot(row, row)

    for s in range(Nslice):
        f[:] = 0
        b = tiltSeries[s, :, :].transpose().flatten()
        for i in range(Niter):
            for j in range(Nrow):
                row[:] = A[j, ].copy()
                row_f_product = np.dot(row, f)
                a = (b[j] - row_f_product) / rowInnerProduct[j]
                f = f + row * a * beta

        recon[s, :, :] = f.reshape((Nray, Nray))

    (iSize, jSize, kSize) = recon.shape

    t1 = time.time()
    print('%d # Reconstruction %s | ' % (partitionId, str(t1 - t0)))
    t0 = t1

    for k in range(kSize):
        for j in range(jSize):
            for i in range(iSize):
                gIdx = i + iOffset + (j * sizeX) + (k * sizeX * sizeY)
                yield (gIdx, recon[i][j][k])

# -------------------------------------------------------------------------
# Spark thresholding
# -------------------------------------------------------------------------

def threshold(value):
    if value[1] < 2.0:
        return (value[0], 0.0)
    return (value[0], value[1])

# -------------------------------------------------------------------------
# MPI data exchange + visualization
# -------------------------------------------------------------------------

def visualization(partitionId, iterator):
    # Setup MPI context
    import os
    os.environ["PMI_PORT"] = pmi_port
    os.environ["PMI_ID"] = str(partitionId)
    os.environ["PV_ALLOW_BATCH_INTERACTION"] = "1"
    os.environ["DISPLAY"] = ":0"

    # Extract iOffset
    iOffset = 0
    localSizeX = getMPISizeX(partitionId)
    size = localSizeX * sizeY * sizeY
    for i in range(partitionId):
        iOffset += getMPISizeX(i)

    # Copy data from iterator into data chunk
    t0 = time.time()
    count = 0
    dataChunk = np.arange(size, dtype=float)
    for item in iterator:
        count += 1
        globalIndex = item[0]
        pixelValue = item[1]
        # print('%d # %d: %f' % (partitionId, globalIndex, pixelValue))
        ijk = _ijk(globalIndex)
        ijk[0] -= iOffset
        destIdx = ijk[0] + (ijk[1] * localSizeX)  + (ijk[2] * localSizeX * sizeY)
        dataChunk[destIdx] = pixelValue

    t1 = time.time()
    print('%d # MPI Gather %s | %d' % (partitionId, str(t1 - t0), count))
    t0 = t1

    # Configure Paraview for MPI
    import paraview
    paraview.options.batch = True

    from vtk.vtkPVVTKExtensionsCore import vtkDistributedTrivialProducer
    from vtk.vtkCommonCore import vtkIntArray, vtkUnsignedCharArray, vtkFloatArray
    from vtk.vtkCommonDataModel import vtkImageData, vtkPointData

    # -------------------------------------------------------------------------
    # Data access helper
    # -------------------------------------------------------------------------

    def createSlice():
        size = sizeY * sizeY
        array = np.arange(size, dtype=float)
        return array

    def getSideSlice(offset, xSize):
        size = sizeY * sizeY
        slice = np.arange(size, dtype=float)

        for i in range(size):
            slice[i] = dataChunk[int(offset + (i * xSize))]
        return slice

    # -------------------------------------------------------------------------
    # Add ghost points from neighbors
    # -------------------------------------------------------------------------

    from mpi4py import MPI
    comm = MPI.COMM_WORLD
    remoteLowerSlice = None
    remoteUpperSlice = None

    if partitionId + 1 < nbMPIPartition:
        # Share upper slice
        remoteUpperSlice = createSlice()
        localUpperSlice = getSideSlice(localSizeX - 1, localSizeX)
        comm.Sendrecv(localUpperSlice, (partitionId+1), (2*partitionId + 1), remoteUpperSlice, (partitionId+1), (2*partitionId))
    if partitionId > 0:
        # Share lower slice
        remoteLowerSlice = createSlice()
        localLowerSlice = getSideSlice(0, localSizeX)
        comm.Sendrecv(localLowerSlice, (partitionId-1), (2 * (partitionId - 1)), remoteLowerSlice, (partitionId-1), (2 * (partitionId - 1) + 1))

    t1 = time.time()
    print('%d # MPI share %s | ' % (partitionId, str(t1 - t0)))
    t0 = t1

    # -------------------------------------------------------------------------

    dataset = vtkImageData()
    minX = 0
    maxX = 0
    for i in range(partitionId + 1):
        minX = maxX
        maxX += getMPISizeX(i)

    # -------------------------------------------------------------------------
    # Add slice(s) to data
    # -------------------------------------------------------------------------

    arrayWithSlices = vtkFloatArray()
    arrayWithSlices.SetName('Scalars')
    if remoteLowerSlice != None and remoteUpperSlice != None:
        # Add both slices
        minX -= 1
        maxX += 1
        localSizeX = maxX - minX
        newSize = localSizeX * sizeY * sizeY
        arrayWithSlices.SetNumberOfTuples(newSize)
        localOffset = 0
        for i in range(newSize):
            if i % localSizeX == 0:
                arrayWithSlices.SetTuple1(i, remoteLowerSlice[i / localSizeX])
            elif (i + 1) % localSizeX == 0:
                arrayWithSlices.SetTuple1(i, remoteUpperSlice[((i + 1) / localSizeX) - 1])
            else:
                arrayWithSlices.SetTuple1(i, dataChunk[localOffset])
                localOffset += 1

    elif remoteLowerSlice != None:
        # Add lower slice
        minX -= 1
        localSizeX = maxX - minX
        newSize = localSizeX * sizeY * sizeY
        arrayWithSlices.SetNumberOfTuples(newSize)
        localOffset = 0
        for i in range(newSize):
            if i % localSizeX == 0:
                arrayWithSlices.SetTuple1(i, remoteLowerSlice[i / localSizeX])
            else:
                arrayWithSlices.SetTuple1(i, dataChunk[localOffset])
                localOffset += 1
    elif remoteUpperSlice != None:
        # Add upper slice
        maxX += 1
        localSizeX = maxX - minX
        newSize = localSizeX * sizeY * sizeY
        arrayWithSlices.SetNumberOfTuples(newSize)
        localOffset = 0
        for i in range(newSize):
            if (i + 1) % localSizeX == 0:
                arrayWithSlices.SetTuple1(i, remoteUpperSlice[((i + 1) / localSizeX) - 1])
            else:
                arrayWithSlices.SetTuple1(i, dataChunk[localOffset])
                localOffset += 1

    dataset.SetExtent(minX, maxX - 1, 0, sizeY - 1, 0, sizeY - 1)
    dataset.GetPointData().SetScalars(arrayWithSlices)

    t1 = time.time()
    print('%d # build resutling image data %s | ' % (partitionId, str(t1 - t0)))
    t0 = t1

    # -------------------------------------------------------------------------

    vtkDistributedTrivialProducer.SetGlobalOutput('Spark', dataset)

    from vtk.vtkPVClientServerCoreCore import vtkProcessModule
    from paraview     import simple
    from vtk.web      import server
    from paraview.web import wamp as pv_wamp
    from paraview.web import protocols as pv_protocols

    class _VisualizerServer(pv_wamp.PVServerProtocol):
        dataDir = '/data'
        groupRegex = "[0-9]+\\.[0-9]+\\.|[0-9]+\\."
        excludeRegex = "^\\.|~$|^\\$"
        allReaders = True
        viewportScale=1.0
        viewportMaxWidth=2560
        viewportMaxHeight=1440

        def initialize(self):
            # Bring used components
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebFileListing(_VisualizerServer.dataDir, "Home", _VisualizerServer.excludeRegex, _VisualizerServer.groupRegex))
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebProxyManager(baseDir=_VisualizerServer.dataDir, allowUnconfiguredReaders=_VisualizerServer.allReaders))
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebColorManager())
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebMouseHandler())
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPort(_VisualizerServer.viewportScale, _VisualizerServer.viewportMaxWidth,
                                                                         _VisualizerServer.viewportMaxHeight))
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPortImageDelivery())
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebViewPortGeometryDelivery())
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebTimeHandler())
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebSelectionHandler())
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebWidgetManager())
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebKeyValuePairStore())
            self.registerVtkWebProtocol(pv_protocols.ParaViewWebSaveData(baseSavePath=_VisualizerServer.dataDir))
            # Disable interactor-based render calls
            simple.GetRenderView().EnableRenderOnInteraction = 0
            simple.GetRenderView().Background = [0,0,0]
            # Update interaction mode
            pxm = simple.servermanager.ProxyManager()
            interactionProxy = pxm.GetProxy('settings', 'RenderViewInteractionSettings')
            interactionProxy.Camera3DManipulators = ['Rotate', 'Pan', 'Zoom', 'Pan', 'Roll', 'Pan', 'Zoom', 'Rotate', 'Zoom']


    pm = vtkProcessModule.GetProcessModule()

    # -------------------------------------------------------------------------

    print('%d # > Start visualization - %s | ' % (partitionId, str(datetime.now())))

    # -------------------------------------------------------------------------

    args = Options()
    if pm.GetPartitionId() == 0:
        print('%d # ==> %d' % (partitionId, pm.GetPartitionId()))
        producer = simple.DistributedTrivialProducer()
        producer.UpdateDataset = ''
        producer.UpdateDataset = 'Spark'
        producer.WholeExtent = [0, sizeX - 1, 0, sizeY - 1, 0, sizeY - 1]
        server.start_webserver(options=args, protocol=_VisualizerServer)
        pm.GetGlobalController().TriggerBreakRMIs()

    print('%d # < Stop visualization - %s | ' % (partitionId, str(datetime.now())))
    yield (partitionId, nbMPIPartition)

# -------------------------------------------------------------------------
# Spark pipeline
# -------------------------------------------------------------------------

def swap(kv):
    return (kv[1], kv[0])

t0 = time.time()
data = sc.parallelize(npArray)
rdd = data.zipWithIndex().map(swap)

rdd.partitionBy(nbSparkPartition, getSparkPartition).mapPartitionsWithIndex(reconstruct).map(threshold) \
   .partitionBy(nbMPIPartition, getMPIPartition).mapPartitionsWithIndex(visualization) \
   .collect()

t1 = time.time()
print('### Total execution time - %s | ' % str(t1 - t0))

print('### Stop execution - %s' % str(datetime.now()))
