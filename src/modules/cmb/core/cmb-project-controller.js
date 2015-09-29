angular.module("kitware.cmb.core")
    .controller('CmbProjectController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$interval', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $interval) {
        var timeoutId = 0;

        function findSimulationIndexById(id) {
            for (var i=0; i < $scope.simulations.length; i++) {
                if ($scope.simulations[i].meta.taskId === id || $scope.simulations[i].meta.taskId === undefined) {
                    return i;
                }
            }
            return -1;
        }

        $scope.$on('task.status', function(event, data) {
            var simIndex = findSimulationIndexById(data._id);
            console.log('event received: ', data.status);
            if (simIndex < 0) {
                console.error('_id '+data._id+' not found');
            } else {
                // add task if it's missing, update status
                if ($scope.simulations[simIndex].meta.taskId === undefined){
                    $scope.simulations[simIndex].meta.taskId = data._id;
                    $scope.simulations[simIndex].meta.status = data.status;
                    $girder.patchItemMetadata($scope.simulations[simIndex]._id, {status: data.status, taskId: data._id});
                    $scope.$apply();
                } else {
                    $scope.simulations[simIndex].meta.status = data.status;
                    $girder.patchItemMetadata($scope.simulations[simIndex]._id, {status: data.status});
                    $scope.$apply();
                }
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
            complete: true,
        };
        angular.extend($scope.filters, {
            terminated: 'error',
            failure: 'error'
        });

        var logInterval = null;

        $scope.taskLog = '';
        $scope.panelState = {index: -1, open: false};

        $scope.toggleSimulationFilter = function (event, filter) {
            event.currentTarget.classList.toggle('md-raised');
            $scope.filters[filter] = !$scope.filters[filter];
        };

        $scope.simulationFilter = function(filters) {
            return function(sim) {
                var key = sim.meta.status;
                if (typeof filters[key] === 'string') {
                    key = filters[key];
                }
                return filters[key] === true ||
                    !filters.hasOwnProperty(sim.meta.status);
                    //^ show the item if meta.status is _not_ in filters,
                    // this was a good case of weird bugs with super easy solutions.
            };
        };

        $scope.simulationClassByStatus = function(status) {
            var base = {
                incomplete: 'fa-pencil-square-o incomplete',
                valid: 'fa-check-square-o valid',
                running: 'fa-rocket running',
                error: 'fa-warning error',
                complete: 'fa-database complete'
            };
            angular.extend(base, {
                failure: base.error,
                terminated: base.error
            });
            return base[status];
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

        // Simulation drop down controls
        $scope.cloneSimulation = function(simulation) {
            $scope.createSimulation(event, simulation);
        };

        $scope.downloadSimulation = function(simulation) {
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
        $scope.terminateCluster = function(simulation) {
            $girder.terminateTask(simulation);
        };
        $scope.deleteSimulation = function(simulation) {
            if (!confirm('Are you sure youw want to delete "' + simulation.name + '?"')) {
                return;
            }

            $girder.deleteItem(simulation._id)
                .then(function() {
                    if (simulation.meta.hasOwnProperty('taskId')) {
                        return $girder.deleteTask(simulation);
                    }
                })
                .then(function() {
                    updateScope();
                });
        };

        $scope.taskCallback = function(simulationResponse) {
            // Handle mesh viewer state
            // goTo ...
            console.log("taskCallback");
            console.log(simulationResponse[1]);
        };

        $scope.editSimulation = $state.go;

        $scope.panelStateToggle = function(index) {
            var state = angular.copy($scope.panelState);
            if (index !== state.index) {
                state.index = index;
                state.open = true;
            } else {
                state.open = !state.open; //opening and closing the same panel
            }
            $scope.panelState = state;
            //console.log('panel ' + $scope.panelState.index + ' is ' + ($scope.panelState.open ? 'open' : 'closed'));
            var simulation = $scope.simulations[index];
            if (simulation.meta.status === 'running' && $scope.panelState.open) {
                if (!simulation.meta.taskId) {
                    console.error('No taskId for simulation.');
                    return;
                }
                $girder.getTask(simulation)
                    .then(function(data) {
                        if (data.data.log[0].$ref) {
                            var offset = 0,
                                url = data.data.log[0].$ref;
                            $scope.taskLog = '';
                            logInterval = $interval(function() {
                                $girder.getTaskLog(url)
                                    .then(function(logData) {
                                        $scope.taskLog += '[' + logData.created + '] ' +
                                            logData.name + ': ' + logData.msg + '\n';
                                    });
                            }, 2000);
                        }
                        else {
                            console.log('No $ref for task');
                        }
                    });
            } else if (!$scope.panelState.open) {
                if (logInterval !== null) {
                    $interval.cancel(logInterval);
                }
            }
        };

        $scope.calculateCost = function(cost, startTime) {
            var now = new Date().getTime();
            return (cost * (now - startTime) / 3600000).toFixed(3);
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
                        console.error("no items found");
                    }

                    $scope.simulations = [];
                    $scope.itemClusterType = {};
                    function populateClusterTypes(key) {
                        return function (data) {
                            $scope.itemClusterType[key] = data.data.output.cluster.type;
                        };
                    }
                    while(count--) {
                        if(items[count].name === 'mesh') {
                            $scope.meshItem = items[count];
                            $girder.listItemFiles(items[count]._id).success(extractExodusFile);
                        } else {
                            // Simulation
                            $scope.simulations.push(items[count]);
                            if (items[count].meta.taskId) {
                                $girder.getTask(items[count])
                                    .then(populateClusterTypes(items[count].name));
                            }
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