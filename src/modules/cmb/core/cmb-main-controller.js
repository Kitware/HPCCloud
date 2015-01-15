angular.module("kitware.cmb.core")
    .controller('cmb.CoreController', ['$scope', 'kw.Girder', '$modal', '$templateCache', '$state', '$stateParams', 'CmbWorkflowHelper', '$mdDialog', '$window', '$mdToast', function ($scope, $girder, $modal, $templateCache, $state, $stateParams, CmbWorkflowHelper, $mdDialog, $window, $mdToast) {
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
        $scope.title = "Cloud HPC";
        $scope.subTitle = "";
        $scope.collection = null;
        $scope.project = null;
        $scope.simulation = null;

        var previousActiveId = {
            collectionName: '',
            projectID: '',
            simulationID: ''
        };

        $scope.$on('$stateChangeSuccess', function(event) {
            var projectId = $stateParams.projectID,
                collectionName = $stateParams.collectionName,
                simulationId = $stateParams.simulationID;

            if(collectionName && previousActiveId.collectionName !== collectionName) {
               $girder.getCollectionFromName(collectionName).success(function(collections){
                    $scope.collection = collections[0];
                    previousActiveId.collectionName = collectionName;
                    CmbWorkflowHelper.getTemplate(collections[0].name);
                }).error(function(){
                    console.log('Error while fetching collection');
                    previousActiveId.collectionName = '';
                    $scope.collection = null;
                });
            }

            if(simulationId && previousActiveId.simulationID !== simulationId) {
               $girder.getItem(simulationId).success(function(simulation){
                    $scope.simulation = simulation;
                    previousActiveId.simulationID = simulationId;
                }).error(function(){
                    console.log('Error while fetching collection');
                    previousActiveId.simulationID = '';
                    $scope.simulation = null;
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
            }

            if(!projectId) {
                $scope.subTitle = null;
                $scope.project = null;
                previousActiveId.projectID = '';
            }
        });

        $scope.getActiveCollection = function() {
            if($stateParams.collectionName) {
                return $stateParams.collectionName;
            }
            return previousActiveId.collectionName === '' ? null : previousActiveId.collectionName;
        };

        $scope.getActiveProject = function() {
            if($stateParams.projectID) {
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

        $scope.logout = function () {
            $girder.logout();
        };

        $scope.login = function (user, password) {
            $girder.login(user, password);
        };

        $scope.runTask = function (event, title, taskName, hasLauncher, callback) {
            var simulation = $scope.simulation,
                collectionName = $scope.collection.name;

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                    $scope.hasLauncher = hasLauncher;
                    $scope.machines = machines;
                    $scope.title = title;
                    $scope.data = angular.copy($window.WorkflowHelper[collectionName]['default-simulation-cluster']);

                    $scope.updateCost = function() {
                        var cost = 0,
                            array = machines,
                            count = array.length;

                        while(count--) {
                            if(array[count].id === $scope.data.type) {
                               cost = array[count].cost;
                               $scope.data.cores =  array[count].cpu;
                            }
                        }

                        cost *= Number($scope.data.size);
                        $scope.data.cost = cost;
                    };
                    $scope.updateCost();

                    $scope.ok = function(response) {
                        // Delegate the start class on the callback function
                        $mdDialog.hide([simulation, response, $girder.getTaskId(collectionName, taskName)]);
                    };

                    $scope.cancel = function() {
                      $mdDialog.cancel();
                    };
                }],
                template: $templateCache.get('cmb/core/tpls/cmb-run-task-dialog.html'),
                targetEvent: event,
            })
            .then(callback, function() {
                // Nothing to do when cancel
            });
        };

        $scope.$on('login', function (event, user) {
            $scope.user = user;
            $state.go('home');
            $girder.fetchTaskList();
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

        if($girder.getUser() === null) {
            $state.go('login');
        }

        $scope.$on('notification-message', function (evt, message) {
            if(message === null) {
                $mdToast.hide();
            } else {
                var percentage = message.type === 'upload' ? Math.floor(100 * message.done / message.total) : 0;
                $mdToast.show(
                    $mdToast.simple()
                        .content( message.type === 'upload' ? (message.file + '  ' + percentage + ' %') : (message.message))
                        .position('bottom left right')
                        .hideDelay(5000)
                );
            }
        });

    }]);
