# =============================================================================
# Helper methods
# =============================================================================

def histToArray(histogramFilter, field, dataRange, nbBins):
  binSpan = (dataRange[1] - dataRange[0]) / nbBins
  bins = []
  histogramFilter.BinCount = nbBins + 2
  histogramFilter.SelectInputArray = ['POINTS', field]
  histogramFilter.CustomBinRanges = [dataRange[0] - binSpan, dataRange[1] + binSpan]
  histogramFilter.UpdatePipeline()

  ds = histogramFilter.GetClientSideObject().GetOutput()
  array = ds.GetColumn(1) # 'bin_values'

  if array:
    for i in range(1, nbBins + 1, 1):
      bins.append(array.GetValue(i))

  return bins
