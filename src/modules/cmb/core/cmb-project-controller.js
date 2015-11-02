angular.module("kitware.cmb.core")
    .controller('CmbProjectController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog',
        '$templateCache', '$window', '$timeout', '$interval',
        function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $timeout, $interval) {
        var timeoutId = 0;

        //from https://github.com/tjmehta/101/blob/master/is-object.js
        function isObject (val) {
          return typeof val === 'object' &&
            val !== undefined && val !== null &&
            !Array.isArray(val) &&
            !(val instanceof RegExp) &&
            !(val instanceof String) &&
            !(val instanceof Number);
        }

        //searches just the meta[meta.task]
        function findSimulationIndexById(id) {
            for (var i=0; i < $scope.simulations.length; i++) {
                var meta = $scope.simulations[i].meta;
                if (meta[meta.task].taskId === id || meta[meta.task].taskId === undefined) {
                    return i;
                }
            }
            return -1;
        }

        //searches in all of meta.task, so meta.hydra *and* meta.pvw for example
        function findTaskIndexById(id) {
            for (var i=0; i < $scope.simulations.length; i++) {
                var meta = $scope.simulations[i].meta,
                    keys = Object.keys(meta);
                for (var j=0; j < keys.length; j++) {
                    if (isObject(meta[keys[j]])){
                        if (meta[keys[j]].taskId === id) {
                            console.log('found it.');
                            return {index: i, key: keys[j]};
                        }
                    }
                }
            }
            return {index: -1};
        }

        function fetchOutput(simulation) {
            $girder.listItemFiles(simulation._id).then(function(response) {
                $scope.taskOutput = response.data;
             }, function(error) {
                console.log(error);
            });
        }

        /* itemAttr(item, hasStatus, newAttr, taskName)
        *   if hasStatus, set the new status in the item and return the meta object.
        *   else get the status for the item's active task
        */
        function itemAttr(item, attr, newAttr, taskName) {
            if (!taskName) {
                taskName = item.meta.task;
            }

            if (newAttr) {
                item.meta[taskName][attr] = newAttr;
                var ret = {};
                ret[taskName] = item.meta[taskName];
                return ret;
            }
            else {
                return item.meta[item.meta.task][attr];
            }
        }

        function handleNewTaskStatus(simulation, data, taskName) {
            if (!taskName) {
                taskName = simulation.meta.task;
            }

            // add task if it's missing, update status
            if (itemAttr(simulation, 'taskId') === undefined){
                var newMeta = itemAttr(simulation, 'taskId', data._id, taskName);
                    newMeta = itemAttr(simulation, 'status', data.status, taskName);
                $girder.patchItemMetadata(simulation._id, newMeta);

                if (data.status === 'running' && $scope.panelState.index === data.simIndex) {
                    startLoggingTask(simulation);
                }
            //simply update status.
            } else {
                $girder.patchItemMetadata(simulation._id, itemAttr(simulation, 'status', data.status, taskName));
            }

            //force $digest
            $scope.$apply();

            //show log if finished.
            if ($scope.hasStatus(simulation, finishedStates) && !$scope.taskOutput) {
                fetchOutput(simulation);
            }
        }

        /* This seems convoluted... well it is.
         * 'task.status' receives a data object with {_id, status}. _id refers to the taskId
         * which the status is for. We see if it's a meta object related to the meshtagger,
         * then we try to find it in simulations[n].meta[...meta.task],
         * if we don't find it there we look in the other task meta objects in sim.meta
         * If we find the task we update its status, and possibly its taskId if === null.
         */
        $scope.$on('task.status', function(event, data) {
            if ($scope.project.meta && $scope.project.meta.taskId &&
                    data._id === $scope.project.meta.taskId) {
                $girder.updateFolderMetadata($scope.project._id, {status: data.status});
                $scope.project.meta.status = data.status;
                console.log('new project status: ', data.status);
                return;
            }
            var simIndex = findSimulationIndexById(data._id),
                simulationMeta;
            console.log('event received: ', data.status);
            if (simIndex < 0) {
                console.log('_id '+data._id+' not found, looking in other objects...');
                simIndex = findTaskIndexById(data._id);
                if (simIndex.index < 0) {
                    console.error('_id '+data._id+' not found');
                } else {
                    data.simIndex = simIndex.index;
                    handleNewTaskStatus($scope.simulations[simIndex.index], data, simIndex.key);
                }
            } else {
                data.simIndex = simIndex;
                handleNewTaskStatus($scope.simulations[simIndex], data);
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
            finishedStates = ['error', 'complete', 'failure', 'terminated'],
            loading = {};

        $scope.taskLog = {};
        $scope.panelState = {index: -1, open: false};

        $scope.toggleSimulationFilter = function (event, filter) {
            event.currentTarget.classList.toggle('md-raised');
            $scope.filters[filter] = !$scope.filters[filter];
        };

        $scope.simulationFilter = function(filters) {
            return function(sim) {
                var key = sim.meta[sim.meta.task].status;
                if (typeof filters[key] === 'string') {
                    key = filters[key];
                }
                return filters[key] === true ||
                    !filters.hasOwnProperty(sim.meta[sim.meta.task].status);
                    //^ show the item if meta.status is _not_ in filters
            };
        };

        $scope.getActiveMeta = function(item) {
            return item.meta[item.meta.task];
        };

        $scope.simulationClassByStatus = function(item) {
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
            return base[item.meta[item.meta.task].status];
        };

        $scope.projectInfo = function(ev) {
            var mesh = $scope.mesh;
            $mdDialog.show({
                controller: function($scope, $mdDialog) {
                    $scope.mesh = mesh;
                    $scope.ok = function() {
                        $mdDialog.hide();
                    };
                },
                template: $templateCache.get('cmb/core/tpls/cmb-project-info-panel.html'),
                targetEvent: ev,
                clickOutsideToClose: true
            });
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
            .then(function(newSimulation) {
                // Move to the newly created simulation
                if (simulation && loading[simulation._id].cloning === true) {
                    loading[simulation._id].cloning = false;
                }
                updateScope();
            }, function() {
                if (simulation && loading[simulation._id].cloning === true) {
                    loading[simulation._id].cloning = false;
                }
            });
        };

        // Simulation drop down controls
        $scope.cloneSimulation = function(simulation) {
            loading[simulation._id] = {cloning: true};
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
            loading[simulation._id] = {deleting: true};
            $girder.deleteItem(simulation)
                .then(function() {
                    var tmp = angular.copy($scope.simulations);
                    tmp.splice(tmp.length-1, 1);
                    $scope.simulations = tmp;
                    loading[simulation._id].deleting = false;
                    if (simulation.meta.hasOwnProperty('taskId')) {
                        return $girder.deleteTask(simulation);
                    }
                }, function(error) {
                    console.error('error deleting item:', error.message || error.data.message);
                    loading[simulation._id].deleting = false;
                })
                .then(function() {
                    updateScope();
                }, function(error) {
                    console.error('error deleting task:', error.message || error.data.message);
                });
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
            if ($scope.hasStatus(simulation, 'running') && $scope.panelState.open) {
                if (!itemAttr(simulation, 'taskId')) {
                    console.error('No taskId for simulation.');
                } else {
                    startLoggingTask(simulation);
                }
            } else if ($scope.hasStatus(simulation, finishedStates) && $scope.panelState.open) {
                fetchOutput(simulation);
                fetchLog(simulation);
            } else if (!$scope.panelState.open) {
                if (logInterval !== null) {
                    $interval.cancel(logInterval);
                }
            }
        };

        $scope.goToVisualization = function($event, simulation) {
            if (simulation.meta[simulation.meta.task].status === 'running') {
                $state.go('viewer', { collectionName: $stateParams.collectionName,
                    projectID: simulation.folderId,
                    sessionId: simulation.meta.sessionId,
                    taskId: simulation.meta[simulation.meta.task].taskId,
                    done: true
                });
            } else {
                console.log('start new viz task');
                $scope.runTask($event,
                    'Start result viewer', 'pvw',
                    false, simulation, $scope.runVisualizationCallback);
            }
        };

        $scope.goToMeshTagger = function($event) {
            function cleanAndGotoTagger() {
                $girder.getItemFiles($scope.meshItem._id)
                    .then(function(res) {
                        res.data.forEach(function(file) {
                            if (!/\.exo$/.test(file.name)) {
                                $girder.deleteFile(file._id);
                            }
                        });
                    })
                    .then( function() {
                        $scope.runTask($event, 'Start mesh tagger', 'meshtagger', false,
                            $scope.meshItem,
                            $scope.runTaggerCallback);
                    });
            }

            if ($scope.project.meta && $scope.project.meta.status &&
                    $scope.project.meta.status === 'running') {
                $girder.getTaskWithId($scope.project.meta.taskId)
                    .then(function(res) {
                        if (res.data.status !== 'running') {
                            $scope.project.meta.status = res.data.status;
                            $girder.updateFolderMetadata($scope.projectID, res.data.status)
                                .then(cleanAndGotoTagger);
                        } else {
                            //go to mesh
                            $state.go('mesh', {
                                collectionName: $stateParams.collectionName,
                                projectID: $scope.meshItem.folderId,
                                meshItemId: $scope.mesh._id,
                                sessionId: $scope.project.meta.sessionId,
                                taskId: $scope.project.meta.taskId,
                                done: true
                            });
                        }
                    }, function(err) {
                        console.log('error getting getTaskWithId: ', $scope.project.meta.taskId, err.data.message);
                        cleanAndGotoTagger();
                    });
            } else {
                cleanAndGotoTagger();
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
            if (ms.length < 3) {
                while(ms.length < 3) {
                    ms = '0' + ms;
                }
            }

            return hours + ':' + minutes + ':' + seconds + '.' + ms;
        }

        $scope.calculateCost = function(cost, startTime) {
            var now = new Date().getTime();
            return (cost * (now - startTime) / 3600000).toFixed(3);
        };

        $scope.hasStatus = function(simulation, set) {
            var status = simulation.meta[simulation.meta.task].status;
            if (!Array.isArray(set)) {
                return status === set;
            } else {
                return set.indexOf(status) !== -1;
            }
        };

        $scope.isLoading = function(sim, state) {
            return loading.hasOwnProperty(sim._id) && loading[sim._id][state] === true;
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
            $scope.meshItem.meshFile = exoFile;
        }

        function updateScope() {

            function getTaskCallback(item, index) {
                return function(res) {
                    if (res.data.output.cluster) {
                        $scope.itemClusterType[item.name] = res.data.output.cluster.type;
                    }
                    if (res.data.status !== itemAttr(item, status)) {
                        //console.log('status for "' + item.name + '", '+ index +' change, ' + item.meta.status + ' -> ' + res.data.status);
                        item.meta[item.meta.task].status = res.data.status;
                        $scope.simulations[index] = item;
                        $girder.patchItemMetadata(item._id, {status: res.data.status});
                    }
                };
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

        $scope.$on('notification-message', function (evt, message) {
            if(message === null) { //upload complete, see kw.girder.js:@uploadNextChunk
                updateScope(); //update current scope
            }
        });

        // $scope.$on('$stateChangeSuccess', updateScope);

        if(!$girder.hasToken()) {
            $state.go('login');
        } else {
            updateScope();
        }
    }]);