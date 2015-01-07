angular.module("kitware.cmb.core")
    .controller('CmbSimulationController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$http', '$timeout', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $http, $timeout) {

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

        $scope.parameterDataTemplate = {};

        $scope.activateSection = function(id) {
            $scope.activeSection = id;
        };

        $scope.runSimulation = function(event) {
            var simulation = $scope.simulation,
                collectionName = $scope.collection.name;

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                    $scope.machines = machines;
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
                        $window.WorkflowHelper[collectionName]['run-simulation'](simulation, $girder, response, $mdDialog);
                    };

                    $scope.cancel = function() {
                      $mdDialog.cancel();
                    };
                }],
                template: $templateCache.get(collectionName + '/dialog/run-simulation.html'),
                targetEvent: event,
            })
            .then(function(simulation) {
                // Move to the newly created simulation
                updateScope();
                $state.go('project', { collectionID: $stateParams.collectionID, projectID: $stateParams.projectID});
            }, function() {
                // Nothing to do when close
            });
        };

        function updateScope() {
            if($scope.collection) {
                $http
                .get('assets/wf/' + $scope.collection.name + '/input-template.json')
                .success(function(data, status, headers, config) {
                    $scope.parameterDataTemplate = data;
                })
                .error(function(data, status, headers, config) {
                    $scope.parameterDataTemplate = {};
                });
            } else {
                $timeout(updateScope);
            }
        }

        if($girder.getUser() === null) {
            $state.go('login');
        } else {
            updateScope();
        }
    }]);
