angular.module("kitware.cmb.core")
    .controller('CmbProjectController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$interval', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $interval) {
        var timeoutId = 0;

        // BEGIN - Refresh simulation status base on task progress every 10s
        timeoutId = $interval(function() {
            var array = $scope.simulations,
                count = array.length,
                needUpdate = false;

            while(count--) {
                if(array[count].meta && array[count].meta.task === 'terminated') {
                    $girder.deleteTask(array[count]);
                    needUpdate = true;
                } else if(array[count].meta && array[count].meta.taskId) {
                    console.log('update task');
                    $girder.updateTaskStatus(array[count]);
                    needUpdate = true;
                }
            }

            if(needUpdate) {
                needUpdate = false;
                updateScope();
            }
        }, 10000);

        $scope.$on('$destroy', function() {
            console.log('$destroy CmbProjectController');
            $interval.cancel(timeoutId);
        });
        // END - Refresh simulation status base on task progress every 10s

        $scope.parameterDataTemplate = {};

        $scope.meshItem = null;
        $scope.mesh = null;
        $scope.simulations = [];

        $scope.toggleSimulationFilter = function (event) {
            event.target.classList.toggle('md-raised');
        };

        $scope.createSimulation = function (event, simulation) {
            var projectId = $scope.getActiveProject(),
                collectionName = $scope.collection.name;

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                    $scope.ok = function(response) {
                        if ($scope.data.name.trim() === '') {
                            return;
                        }
                        $window.WorkflowHelper[collectionName]['create-simulation'](projectId, $girder, response, $mdDialog, simulation);
                    };
                    $scope.cancel = function() {
                      $mdDialog.cancel();
                    };
                    $scope.data = {
                        name: '',
                        description: ''
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
                                console.log('file list:', fileList);
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
                        if (!confirm('Are you sure youw want to delete "' + simulation.name + '?"')) {
                            return;
                        }
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

        $scope.taskCallback = function(simulationResponse) {
            // Handle mesh viewer state
            // goTo ...
            console.log("taskCallback");
            console.log(simulationResponse[1]);
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
                            $scope.meshItem = items[count];
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
