angular.module("kitware.cmb.core")
    .controller('CmbProjectController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window) {

        $scope.mesh = null;
        $scope.simulations = [];

        $scope.toggleSimulationFilter = function (event) {
            event.originalTarget.classList.toggle('md-raised');
        };

        $scope.createSimulation = function (event, simulation) {
            var projectId = $scope.getActiveProject(),
                collectionName = $scope.collection.name;

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                    $scope.ok = function(response) {
                        $window.WorkflowHelper[collectionName]['create-simulation'](projectId, $girder, response, $mdDialog, simulation);
                    };
                    $scope.cancel = function() {
                      $mdDialog.cancel();
                    };
                }],
                template: $templateCache.get(collectionName + '/tpls/create-simulation.html'),
                targetEvent: event,
            })
            .then(function(simulation) {
                // Move to the newly created simulation
                updateScope();
            }, function() {
                // Nothing to do when close
            });
        };

        $scope.manageSimulation = function(event, simulation) {
            var projectId = $scope.getActiveProject(),
                collectionName = $scope.collection.name,
                cloneFunction = $scope.createSimulation;

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                    $scope.simulation = simulation;
                    $scope.activeCost = simulation.meta.taskId ? Number(simulation.meta.cost) * (1+Math.floor((new Date().getTime() - Number(simulation.meta.startTime))/3600000)) : 0;
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.terminateCluster = function(simulation) {
                        $girder.terminateTask(simulation);
                        $mdDialog.hide(simulation);
                    };
                    $scope.cloneSimulation = function(event, simulation) {
                        $mdDialog.hide(simulation);
                        cloneFunction(event, simulation);
                    };
                    $scope.downloadSimulation = function(simulation) {
                        $mdDialog.hide(simulation);
                        $girder.listItemFiles(simulation._id)
                            .success(function(fileList) {
                                console.log(fileList);
                                var downloadName = fileList.length > 1 ? simulation.name + '.zip' : fileList[0].name;
                                $girder.downloadItem(simulation._id)
                                    .success(function(data) {
                                        $window.saveAs(new Blob([data], {type: "application/octet-stream"}), downloadName);
                                    })
                                    .error(function() {
                                        console.log("Download error");
                                    });
                            })
                            .error(function(){
                                console.log("error in file listing");
                            });

                    };
                    $scope.deleteSimulation = function(simulation) {
                        $girder.deleteItem(simulation._id)
                            .success(function(){
                                $mdDialog.hide(simulation);
                            })
                            .error(function(){
                                $mdDialog.hide(simulation);
                            });

                    };

                }],
                template: $templateCache.get('cmb/core/tpls/cmb-simulation-control.html'),
                targetEvent: event,
            })
            .then(function(simulation) {
                // Move to the newly created simulation
                updateScope();
            }, function() {
                // Nothing to do when close
            });
        };

        function extractExodusFile(files) {
            var exoFile = null,
                fCount = files.length;

            while(fCount--) {
                if (files[fCount].exts[0] === 'exo') {
                    exoFile = files[fCount];
                }
            }

            $scope.mesh = exoFile;
        }

        function updateScope() {
            $girder.listItems($scope.getActiveProject())
                .success(function (items) {
                    var count = items.length;
                    if (count === 0) {
                        console.error("no item found");
                    }

                    $scope.simulations = [];
                    while(count--) {
                        if(items[count].name === 'mesh') {
                            $girder.listItemFiles(items[count]._id).success(extractExodusFile);
                        } else {
                            // Simulation
                            $scope.simulations.push(items[count]);
                        }
                    }
                })
                .error(function(err) {
                    console.log(err);
                });
        }

        // $scope.$on('$stateChangeSuccess', updateScope);

        if($girder.getUser() === null) {
            $state.go('login');
        } else {
            updateScope();
        }
    }]);
