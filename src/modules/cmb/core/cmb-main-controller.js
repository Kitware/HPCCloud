angular.module("kitware.cmb.core")
    .controller('cmb.CoreController', ['$scope', 'kw.Girder', '$window', '$templateCache', '$timeout',
        '$state', '$stateParams', '$mdDialog', '$mdToast',
        function ($scope, $girder, $window, $templateCache, $timeout, $state, $stateParams, $mdDialog, $mdToast) {
        var machines = [
            { "id": "m3.medium",    "label": "Basic Small",       "cpu": 1, "gpu": 0, "memory": 3.75, "cost": 0.07, "storage": [4] },
            { "id": "m3.large",     "label": "Basic Medium",      "cpu": 2, "gpu": 0, "memory": 7.5,  "cost": 0.14, "storage": [32] },
            { "id": "m3.xlarge",    "label": "Basic Large",       "cpu": 4, "gpu": 0, "memory": 15,   "cost": 0.28, "storage": [40,40] },
            { "id": "m3.2xlarge",   "label": "Basic Extra Large", "cpu": 8, "gpu": 0, "memory": 30,   "cost": 0.56, "storage": [80,80] },

            { "id": "c3.large",     "label": "Compute Small",    "cpu": 2,  "gpu": 0, "memory": 3.75, "cost": 0.105, "storage": [16,16] },
            { "id": "c3.xlarge",    "label": "Compute Medium",   "cpu": 4,  "gpu": 0, "memory": 7.5,  "cost": 0.21,  "storage": [40,40] },
            { "id": "c3.2xlarge",   "label": "Compute Large",    "cpu": 8,  "gpu": 0, "memory": 15,   "cost": 0.42,  "storage": [80,80] },
            { "id": "c3.4xlarge",   "label": "Compute X Large",  "cpu": 16, "gpu": 0, "memory": 30,   "cost": 0.84,  "storage": [160,160] },
            { "id": "c3.8xlarge",   "label": "Compute XX Large", "cpu": 32, "gpu": 0, "memory": 60,   "cost": 1.68,  "storage": [320,320] },

            { "id": "r3.large",     "label": "Memory Small",    "cpu": 2,  "gpu": 0, "memory": 15.25, "cost": 0.175, "storage": [32] },
            { "id": "r3.xlarge",    "label": "Memory Medium",   "cpu": 4,  "gpu": 0, "memory": 30.5,  "cost": 0.350, "storage": [80] },
            { "id": "r3.2xlarge",   "label": "Memory Large",    "cpu": 8,  "gpu": 0, "memory": 61,    "cost": 0.7,   "storage": [160] },
            { "id": "r3.4xlarge",   "label": "Memory X Large",  "cpu": 16, "gpu": 0, "memory": 122,   "cost": 1.4,   "storage": [320] },
            { "id": "r3.8xlarge",   "label": "Memory XX Large", "cpu": 32, "gpu": 0, "memory": 244,   "cost": 2.8,   "storage": [320,320] },

            { "id": "g2.2xlarge",   "label": "Graphic node", "cpu": 8, "gpu": 1, "memory": 15, "cost": 0.65, "storage": [60,60] }
        ];

        // Authentication / User handling -------------------------------------

        $scope.user = $girder.getUser();
        $scope.subTitle = "";
        $scope.collection = null;
        $scope.project = null;
        $scope.simulation = null;

        var previousActiveId = {
            collectionName: '',
            projectID: '',
            simulationID: ''
        };

        function showToast(message) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .position('bottom right')
                    .hideDelay(3000)
            );
        }

        $scope.$on('$stateChangeSuccess', function(event) {
            var projectId = $stateParams.projectID,
                collectionName = $stateParams.collectionName,
                simulationId = $stateParams.simulationID;

            if(collectionName && previousActiveId.collectionName !== collectionName) {
               $girder.getCollectionFromName(collectionName).success(function(collections){
                    $scope.collection = collections[0];
                    previousActiveId.collectionName = collectionName;
                }).error(function(){
                    console.log('Error while fetching collection');
                    previousActiveId.collectionName = '';
                    $scope.collection = null;
                });
            }

            if(projectId && previousActiveId.projectID !== projectId) {
                $girder.getFolder(projectId).success(function(project){
                    $scope.project = project;
                    $scope.subTitle = project.name;
                    previousActiveId.projectID = projectId;
                }).error(function(){
                    console.log('Error while fetching project');
                    $scope.subTitle = null;
                    $scope.project = null;
                    previousActiveId.projectID = '';
                });
            } else if ($scope.subTitle) {
                $scope.subTitle = $scope.subTitle.split(' ')[0];
            }

            if(simulationId && previousActiveId.simulationID !== simulationId) {
               $girder.getItem(simulationId).success(function(simulation){
                    $scope.simulation = simulation;
                    previousActiveId.simulationID = simulationId;
                    if (/simulation/.test($state.current.url)) {
                        $scope.subTitle += ' / ' + simulation.name;
                    }
                }).error(function(){
                    console.log('Error while fetching simulation');
                    previousActiveId.simulationID = '';
                    $scope.simulation = null;
                });
            }

            if(!projectId) {
                $scope.subTitle = null;
                $scope.project = null;
                previousActiveId.projectID = '';
            }
        });

        $scope.getActiveCollection = function() {
            if (!/project/.test($state.current.url)) {
                return null;
            }
            else if($stateParams.collectionName) {
                return $stateParams.collectionName;
            }
            return previousActiveId.collectionName === '' ? null : previousActiveId.collectionName;
        };

        $scope.getActiveProject = function() {
            if (!/projectID/.test($state.current.url)) {
                return null;
            }
            else if($stateParams.projectID) {
                return $stateParams.projectID;
            }
            return previousActiveId.projectID === '' ? null : previousActiveId.projectID;
        };

        $scope.getActiveSimulation = function() {
            if($stateParams.simulationID) {
                return $stateParams.simulationID;
            }
            return previousActiveId.simulationID === '' ? null : previousActiveId.simulationID;
        };

        $scope.enterPressed = function(event) {
            if (event.keyCode === 13) {
                console.log($scope.userLogin, $scope.userPassword);
                $scope.login($scope.userLogin, $scope.userPassword);
            }
        };

        $scope.logout = function () {
            $girder.logout();
        };

        $scope.login = function (user, password) {
            $girder.login(user, password);
        };

        $scope.registerUser = function(user) {
            if (user.password !== user.passwordConf) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('Passwords do not match')
                        .position('bottom left right')
                        .hideDelay(3000)
                );
                return;
            }

            $girder.registerUser(user)
                .then(function() {
                    $girder.login(user.login, user.password);
                }, function(err) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content(err.data.message)
                            .position('bottom left right')
                            .hideDelay(3000)
                    );
                });
        };

        $scope.runTask = function (event, title, taskName, hasLauncher, simulation, callback) {
            var awsAvailable = true,
                clusterAvailable = true,
                actionForProfileAvailability = function() {
                    if (!awsAvailable && !clusterAvailable) {
                        $mdToast.show(
                            $mdToast.simple()
                                .content('You need at least one valid AWS profile or running Cluster available.')
                                .position('bottom right')
                                .hideDelay(5000)
                            );
                    } else {
                        $mdDialog.show({
                            locals: {
                                title: title,
                                taskName: taskName,
                                hasLauncher: hasLauncher,
                                machines: machines,
                                availability: {EC2: awsAvailable, Traditional: clusterAvailable},
                                collectionName: $scope.collection.name,
                                simulation: simulation
                            },
                            controller: 'CmbSimulationLauncher',
                            template: $templateCache.get('cmb/core/tpls/cmb-run-task-dialog.html'),
                            targetEvent: event,
                        })
                        .then(callback, function() {
                            // Nothing to do when cancel
                        });
                    }
                };

            //make sure that there is at least one aws profile or running cluster available.
            $girder.getAWSProfiles()
                .then(function(data){
                    if (data.data.length === 0) {
                        awsAvailable = false;
                    }
                    return $girder.getClusterProfiles();
                })
                .then(function(data){
                    if (data.data.length === 0 || data.data.every(function(el) {
                        return el.status !== 'running'; //are there any running?
                    })) {
                        clusterAvailable = false;
                    }
                    return actionForProfileAvailability();
                });
        };

        // This is typically the callback that is passed with
        // the above `runTask(event, title, taskName, hasLauncher, callback)`
        $scope.runSimulationCallback = function(args) {
            var simulation = args[0],
                clusterData = args[1],
                taskSpecId = args[2],
                mesh = $scope.mesh;

            $girder.extractMeshInformationFromProject(simulation.folderId, function(meshItem, meshFile){
                var config = {
                    cluster: clusterData,
                    input: {
                        data: {
                            item: {
                                id: meshItem._id
                            }
                        },
                        config: {
                            item: {
                                id: simulation._id
                            }
                        }
                    },
                    mesh: {
                        name: meshFile.name
                    },
                    output: {
                        item: { id: simulation._id }
                    },
                    taskName: args[3]
                };

                if (clusterData.type === 'trad') {
                    config.hydraExecutablePath = args[3].hydraExecutablePath;
                    if (args[3].parallelEnvironment) config.parallelEnvironment = args[3].parallelEnvironment;
                    if (args[3].numberOfSlots) config.numberOfSlots = args[3].numberOfSlots;
                    if (args[3].jobOutputDir) config.jobOutputDir = args[3].jobOutputDir;
                }
                console.log(config);

                $girder.startTask(simulation, taskSpecId, clusterData, config);
            });

            // Move back to the project view
            $state.go('project', { collectionName: $stateParams.collectionName, projectID: simulation.folderId });
        };

        $scope.runVisualizationCallback = function(args) {
            var simulation = args[0],
                clusterData = args[1],
                taskSpecId = args[2],
                config = {
                    output: {
                        item: { id: simulation._id }
                    },
                    taskName: 'pvw'
                };

            $girder.getTask(simulation).then(function (task) {
                var hydraJob = task.data.output.hydra_job,
                    dataDir = hydraJob._id,
                    sessionId = clusterData._id + '/' + hydraJob._id;

                    config.simulationJobId = hydraJob._id;
                    config.dataDir = dataDir;
                    config.cluster = clusterData;

                $girder.startTask(simulation, taskSpecId, clusterData, config);
                $state.go('viewer', { collectionName: $stateParams.collectionName,
                    projectID: simulation.folderId,
                    sessionId: sessionId
                });

            }, function (err) {
                console.log(err);
                showToast(err.data.message);
            });
        };

        $scope.runTaggerCallback = function(args) {
            var mesh = args[0],
                clusterData = args[1],
                taskSpecId = args[2],
                config = {
                    cluster: clusterData,
                    output: {
                        item: { id: mesh._id }
                    },
                    fileId: mesh.meshFile._id,
                    itemId: mesh._id,
                    taskName: 'meshtagger'
                };

            $girder.startTaggerTask(mesh, taskSpecId, clusterData, config)
                .then(function(res) {
                    // there's no res.data so we get the taskId from the url.
                    var taskId = res.config.url.split('/')[4], // /api/v1/tasks/[taskID]
                        sessionId = clusterData._id + '/' + taskId;
                    $state.go('mesh', { collectionName: $stateParams.collectionName,
                        projectID: mesh.folderId,
                        meshItemId: mesh._id,
                        sessionId: sessionId
                    });
                });
        };

        $scope.goHome = function() {
            $state.go('home');
        };

        $scope.$on('login', function (event, user) {
            $scope.user = user;
            if ($state.$current.toString() === 'login' ||
                $state.$current.toString() === 'register') {
                $state.go('home');
            } else {
                $state.go($state.$current.toString(), $stateParams);
            }
        });

        $scope.$on('login-error', function (event) {
            $scope.user = null;
            $scope.$broadcast('notification-message', {
                type: 'error',
                message: 'Invalid login or password'
            });
        });

        $scope.$on('logout-error', function (event) {
            $scope.user = null;
            $scope.$broadcast('notification-message', {
                type: 'error',
                message: 'The logout action failed'
            });
        });

        $scope.$on('logout', function (event) {
            $scope.user = null;
            $state.go('login');
        });

        if(!$girder.hasToken()) {
            $state.go('login');
        }

        var uploadToast = null;
        $scope.$on('notification-message', function (evt, message) {
            var percentage;
            if(message === null) { //upload complete, see kw.girder.js:@uploadNextChunk
                $mdToast.updateContent('Upload Complete');
                $timeout(function() {
                    $mdToast.hide();
                    uploadToast = null;
                }, 2000);
            } else if (uploadToast === null) {
                percentage = message.type === 'upload' ? Math.floor(100 * message.done / message.total) : 0;

                uploadToast = $mdToast.simple()
                    .position('bottom left right')
                    .hideDelay(0); //stay open

                if (message.type === 'upload') {
                    uploadToast.content(message.file + '  ' + percentage + ' %');
                } else {
                    uploadToast.content(message.message);
                }

                $mdToast.show(uploadToast);
            } else {
                percentage = message.type === 'upload' ? Math.floor(100 * message.done / message.total) : 0;
                if (message.type === 'upload') {
                    $mdToast.updateContent(message.file + '  ' + percentage + ' %');
                } else {
                    $mdToast.updateContent(message.message);
                }
            }
        });

    }]);
