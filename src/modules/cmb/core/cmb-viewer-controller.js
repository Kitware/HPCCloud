angular.module("kitware.cmb.core")
    .controller('CmbViewerController', ['$scope', '$state', '$stateParams', '$window', function ($scope, $state, $stateParams, $window) {
        var hostPort = $window.location.host;
        $scope.connectionURL = ($stateParams.mode === 'launcher') ? "/paraview" : "ws://"+hostPort+"/proxy?sessionId=" + $stateParams.mode;
        $scope.itemId = $stateParams.simulationID;
    }]);
