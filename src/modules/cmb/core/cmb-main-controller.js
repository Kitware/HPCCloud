angular.module("kitware.cmb.core")
    .controller('cmb.CoreController', ['$scope', 'kw.Girder', '$modal', '$templateCache', '$state', '$stateParams', function ($scope, $girder, $modal, $templateCache, $state, $stateParams) {

        // Authentication / User handling -------------------------------------

        $scope.user = $girder.getUser();
        $scope.title = "Cloud HPC";
        $scope.subTitle = "";
        $scope.collection = null;
        $scope.project = null;
        $scope.simulation = null;

        var previousActiveId = {
            collectionID: '',
            projectID: '',
            simulationID: ''
        };

        $scope.$on('$stateChangeSuccess', function(event) {
            var projectId = $stateParams.projectID,
                collectionId = $stateParams.collectionID,
                simulationId = $stateParams.simulationID;

            if(collectionId && previousActiveId.collectionID !== collectionId) {
               $girder.getCollection(collectionId).success(function(collection){
                    $scope.collection = collection;
                    previousActiveId.collectionID = collectionId;
                }).error(function(){
                    console.log('Error while fetching collection');
                    previousActiveId.collectionID = '';
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
            return $stateParams.collectionID;
        };

        $scope.getActiveProject = function() {
            return $stateParams.projectID;
        };

        $scope.getActiveSimulation = function() {
            return $stateParams.simulationID;
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

    }]);
