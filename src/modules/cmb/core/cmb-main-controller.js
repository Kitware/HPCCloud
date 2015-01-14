angular.module("kitware.cmb.core")
    .controller('cmb.CoreController', ['$scope', 'kw.Girder', '$modal', '$templateCache', '$state', '$stateParams', 'CmbWorkflowHelper', function ($scope, $girder, $modal, $templateCache, $state, $stateParams, CmbWorkflowHelper) {

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

        $scope.$on('login', function (event, user) {
            $scope.user = user;
            $state.go('home');
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

    }]);
