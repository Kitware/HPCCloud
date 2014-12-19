angular.module("kitware.cmb.core")
    .controller('cmb.CoreController', ['$scope', 'kw.Girder', '$modal', '$templateCache', '$state', '$stateParams', function ($scope, $girder, $modal, $templateCache, $state, $stateParams) {

        // Authentication / User handling -------------------------------------

        $scope.user = $girder.getUser();
        $scope.title = "Cloud HPC";

        $scope.getActiveCollection = function() {
            return $stateParams.collectionID;
        };

        $scope.getActiveProject = function() {
            return $stateParams.projectID;
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
