angular.module("kitware.cmb.core")
    .controller('CmbViewerController', ['$scope', '$stateParams', '$window',
    	function ($scope, $stateParams, $window) {
        var hostPort = $window.location.host;
        $scope.connectionURL = ($stateParams.mode === 'launcher') ? "/paraview" : ("ws://"+hostPort+"/proxy?sessionId=" + encodeURIComponent($stateParams.sessionId));
        $scope.itemId = $stateParams.simulationID;
    }]);
