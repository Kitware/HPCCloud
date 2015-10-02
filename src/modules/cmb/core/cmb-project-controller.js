angular.module("kitware.cmb.core")
    .controller('CmbProjectController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$interval', '$q', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $interval, $q) {
        var timeoutId = 0;

        function findSimulationIndexById(id) {
            for (var i=0; i < $scope.simulations.length; i++) {
                if ($scope.simulations[i].meta.taskId === id || $scope.simulations[i].meta.taskId === undefined) {
                    return i;
                }
            }
            return -1;
        }

        function fetchOutput(simulation) {
            $girder.listItemFiles(simulation._id).then(function(response) {
                $scope.taskOutput = response.data;
             }, function(error) {
                console.log(error);
            });
        }

        $scope.$on('task.status', function(event, data) {
            var simIndex = findSimulationIndexById(data._id), simulation;
            console.log('event received: ', data.status);
            if (simIndex < 0) {
                console.error('_id '+data._id+' not found');
            } else {
                simulation = $scope.simulations[simIndex];
                // add task if it's missing, update status
                if (simulation.meta.taskId === undefined){
                    simulation.meta.taskId = data._id;
                    simulation.meta.status = data.status;
                    $girder.patchItemMetadata(simulation._id, {status: data.status, taskId: data._id});

                    if (data.status === 'running' && $scope.panelState.index === simIndex) {
                        startLoggingTask($scope.simulations[simIndex]);
                    }
                } else {
                    simulation.meta.status = data.status;
                    $girder.patchItemMetadata(simulation._id, {status: data.status});
                }

                $scope.$apply();

                if ($scope.hasStatus(simulation.meta.status, finishedStates) && !$scope.taskOutput) {
                    fetchOutput(simulation);
                }
            }
        });

        $scope.$on('$destroy', function() {
            if (logInterval) {
                $interval.cancel(logInterval);
            }
        });

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

        var logInterval = null,
            finishedStates = ['error', 'complete', 'failure', 'terminated'];

        $scope.taskLog = {};
        $scope.panelState = {index: -1, open: false};
        $scope.apiBase = $girder.getApiBase();

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

        $scope.fileFilter = function() {
            return function(file) {
                return file.size > 0;
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
            if (logInterval && simulation._id === $scope.simulations[$scope.panelState.index]._id) {
                $interval.cancel(logInterval);
            }
        };
        $scope.deleteSimulation = function(simulation) {
            if (!confirm('Are you sure youw want to delete "' + simulation.name + '?"')) {
                return;
            }

            $girder.deleteItem(simulation)
                .then(function() {
                    var tmp = angular.copy($scope.simulations);
                    tmp.splice(tmp.length-1, 1);
                    $scope.simulations = tmp;
                    if (simulation.meta.hasOwnProperty('taskId')) {
                        return $girder.deleteTask(simulation);
                    }
                }, function(error) {
                    console.error('error deleting item:', error.message || error.data.message);
                })
                .then(function() {
                    updateScope();
                }, function(error) {
                    console.error('error deleting task:', error.message || error.data.message);
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
                startLoggingTask(simulation);
            } else if ($scope.hasStatus(simulation.meta.status, finishedStates) && $scope.panelState.open) {
                fetchOutput(simulation);
                fetchLog(simulation);
            } else if (!$scope.panelState.open) {
                if (logInterval !== null) {
                    $interval.cancel(logInterval);
                }
            }
        };

        function startLoggingTask(simulation) {
            $girder.getTask(simulation)
                .then(function(res) {
                    if (res.data.log.length === 0 || !res.data.log[0].hasOwnProperty('$ref')) {
                        console.log('No $ref for task');
                        return;
                    }

                    var offset = 0,
                        url = res.data.log[0].$ref;
                    $scope.taskLog[simulation._id] = '';
                    logInterval = $interval(function() {
                        $girder.getTaskLog(url, offset)
                            .then(function(logData) {
                                var log = logData.data.log;
                                for (var i=0; i < log.length; i++) {
                                    $scope.taskLog[simulation._id] += logFormatter(log[i]);
                                    offset += 1;
                                }
                            });
                    }, 2000);
                });
        }

        function fetchLog(simulation) {
            $girder.getTask(simulation)
                .then(function(res) {
                    if (res.data.log.length === 0 || !res.data.log[0].hasOwnProperty('$ref')) {
                        console.log('No $ref for task');
                        return;
                    }

                    var url = res.data.log[0].$ref;
                    $scope.taskLog[simulation._id] = '';
                    $girder.getTaskLog(url, 0)
                        .then(function(logData) {
                            var log = logData.data.log;
                            for (var i=0; i < log.length; i++) {
                                $scope.taskLog[simulation._id] += logFormatter(log[i]);
                            }
                        });
                });
        }

        function logFormatter(l) {
            var created
            return '[' + formatTime(l.created) + '] ' + l.levelname + ': ' + l.msg + '\n';
        }

        function formatTime(time) {
            var date = new Date(time),
                hours = date.getHours().toString(),
                minutes = date.getMinutes().toString(),
                seconds = date.getSeconds().toString(),
                ms = date.getMilliseconds().toString();

            hours = hours.length === 1 ? '0' + hours : hours;
            minutes = minutes.length === 1 ? '0' + minutes : minutes;
            seconds = seconds.length === 1 ? '0' + seconds : seconds;
            ms.length < 3 ? function(){while(ms.length < 3) {ms = '0'+ms}; return ms;}() : ms;

            return hours + ':' + minutes + ':' + seconds + '.' + ms;
        }

        $scope.calculateCost = function(cost, startTime) {
            var now = new Date().getTime();
            return (cost * (now - startTime) / 3600000).toFixed(3);
        };

        $scope.hasStatus = function(status, arr) {
            return arr.indexOf(status) != -1;
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

            function getTaskCallback(item, index) {
                return function(res) {
                    if (res.data.output.cluster) {
                        $scope.itemClusterType[item.name] = res.data.output.cluster.type;
                    }
                    if (res.data.status !== item.meta.status && res.data.status !== 'complete') {
                        //console.log('status for "' + item.name + '", '+ index +' change, ' + item.meta.status + ' -> ' + res.data.status);
                        item.meta.status = res.data.status;
                        $scope.simulations[index] = item;
                        $girder.patchItemMetadata(item._id, {status: res.data.status});
                    }
                }
            }

            $girder.listItems($scope.getActiveProject())
                .success(function (items) {
                    var count = items.length;
                    if (count === 0) {
                        console.error("no items found");
                    }

                    $scope.simulations = [];
                    $scope.itemClusterType = {};
                    while(count--) {
                        if(items[count].name === 'mesh') {
                            $scope.meshItem = items[count];
                            $girder.listItemFiles(items[count]._id).success(extractExodusFile);
                        } else {
                            // Simulation
                            $scope.simulations.push(items[count]);
                            var index = $scope.simulations.length-1;
                            if (items[count].meta.taskId) {
                                $girder.getTask(items[count])
                                    //we need to isolate some vars so they don't get messed up in async.
                                    .then(getTaskCallback(items[count], index));
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