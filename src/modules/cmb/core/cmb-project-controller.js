angular.module("kitware.cmb.core")
    .controller('CmbProjectController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$interval', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $interval) {
        var timeoutId = 0;

        function findSimulationIndexById(id) {
            for (var i=0; i < $scope.simulations.length; i++) {
                console.log($scope.simulations[i].meta.taskId, id);
                if ($scope.simulations[i].meta.taskId === id || $scope.simulations[i].meta.taskId === undefined) {
                    return i;
                }
            }
            return -1;
        }

        $scope.$on('task.status', function(event, data) {
            var simIndex = findSimulationIndexById(data._id),
                needUpdate = false;

            if (simIndex < 0) {
                console.error('_id '+data._id+' not found');
            } else {
                if ($scope.simulations[simIndex].meta.status === 'terminated') {
                    $girder.deleteTask($scope.simulations[simIndex]);
                } else if ( $scope.simulations[simIndex].meta.taskId === undefined ){
                    $scope.simulations[simIndex].meta.taskId = data._id;
                    $scope.simulations[simIndex].meta.status = data.status;
                    $scope.$apply();
                    $girder.patchItemMetadata($scope.simulations[simIndex]._id, {status: data.status, taskId: data._id});
                } else {
                    $scope.simulations[simIndex].meta.status = data.status;
                    needUpdate = true;
                }
            }

            if(needUpdate) {
                needUpdate = false;
                updateScope();
            }
        });

        // END - Refresh simulation status base on task progress every 10s

        $scope.parameterDataTemplate = {};

        $scope.meshItem = null;
        $scope.mesh = null;
        $scope.simulations = [];
        $scope.filters = {
            incomplete: true,
            running: true,
            error: true,
            valid: true,
            completed: true,
        };
        var aliasFilters = {
            failure: 'error'
        };

        $scope.toggleSimulationFilter = function (event, filter) {
            event.currentTarget.classList.toggle('md-raised');
            $scope.filters[filter] = !$scope.filters[filter];
        };

        $scope.simulationFilter = function(filters) {
            return function(sim) {
                return filters[sim.meta.status] === true ||
                    filters[aliasFilters[sim.meta.status]] === true ||
                    !filters.hasOwnProperty(sim.meta.status);
                    //^ show the item if meta.status is _not_ in filters,
                    // this was a good case of weird bugs with super easy solutions.
            };
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
                console.log(simulation);
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