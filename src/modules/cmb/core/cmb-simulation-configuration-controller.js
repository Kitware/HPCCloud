angular.module("kitware.cmb.core")
    .controller('cmbSimulationConfigurationController', ['$scope', 'kw.Girder', '$templateCache', '$window', '$timeout', 'CmbWorkflowHelper', function ($scope, $girder, $templateCache, $window, $timeout, CmbWorkflowHelper) {

        $scope.workflow = null;
        $scope.template = null;
        $scope.dataModel = null;
        $scope.activeSection = null;

        function extractDefault(parameter) {
            var value = parameter.default,
                size = Number(parameter.size),
                type = parameter.type;

            if(type === 'enum') {
                if(size === -1) {
                    var enumList = [],
                        idxList = value,
                        count = idxList.length;
                    while(count--) {
                        enumList.push(parameter.enum.values[idxList[count]]);
                    }
                    return enumList;
                } else {
                    return parameter.enum.values[value];
                }
            } else if(['integrer', 'double'].indexOf(type) !== -1) {
                value = Number(value);
            }

            if(size > 1) {
                var result = [];
                while(result.length < size) {
                    result.push(value);
                }
                return result;
            }
            return value;
        }


        function generateViewDataModel(viewId) {
            var definitions = $scope.template.definitions,
                attributes = $scope.template.views[viewId].attributes,
                count = attributes.length,
                viewData = { name: "New view"};

            console.log(attributes);

            // Process each attributes
           while(count--) {
                if(!definitions[attributes[count]].parameters) {
                    console.log("No parameters for " + attributes[count]);
                    continue;
                }

                var params = definitions[attributes[count]].parameters,
                    pCount = params.length,
                    data = {};

                // Keep data inside viewModel
                viewData[attributes[count]] = data;

                // Feel current data object
                while(pCount--) {
                    data[params[pCount].id] = extractDefault(params[pCount]);
                }
            }

            return viewData;
        }

        $scope.addView = function (event, viewId) {
            $scope.dataModel[viewId].push(generateViewDataModel(viewId));
            $scope.activateSection(viewId, $scope.dataModel[viewId].length - 1);
        };

        $scope.removeView = function (viewId, index) {
            console.log('removeView ' + index);
            $scope.dataModel[viewId].splice(index,1);
            $scope.activateSection(null, 0);
        };

        $scope.saveAndValidate = function () {
            console.log($scope.dataModel);
            $girder.uploadContentToItem($scope.simulation._id, 'hydra.json', JSON.stringify($scope.dataModel, undefined, 3));
        };

        $scope.activateSection = function(viewId, index) {
            console.log('activateSection(' + viewId + ', ' + index + ')');
            var viewSubDataModel = null;

            if(!viewId) {
                $scope.activeSection = { view: null, idx: 0, data: {} };
                return;
            }

            // Check if view data already available
            if($scope.dataModel[viewId] && index < $scope.dataModel[viewId].length) {
                viewSubDataModel = $scope.dataModel[viewId][index];
                console.log('got it from model');
            } else {
                // Need to generate data from default
                console.log('generate it');
                viewSubDataModel = generateViewDataModel(viewId);
                console.log(viewSubDataModel);
                if($scope.dataModel[viewId]) {
                    $scope.dataModel[viewId].push(viewSubDataModel);
                } else {
                    $scope.dataModel[viewId] = [ viewSubDataModel ];
                }
            }
            $scope.activeSection = { view: viewId, idx: index, data: viewSubDataModel };
        };

        function fetchData() {
            if($scope.collection && CmbWorkflowHelper.getTemplate($scope.collection.name) !== null && $scope.simulation) {
                $scope.workflow = $scope.collection.name;
                $scope.template = CmbWorkflowHelper.getTemplate($scope.collection.name);
                $girder.downloadContentFromItem($scope.simulation._id, 'hydra.json', function(dataModelFromServer) {
                    $scope.dataModel = dataModelFromServer || {};
                });
            } else {
                $timeout(fetchData, 100);
            }
        }

        fetchData();
    }]);
