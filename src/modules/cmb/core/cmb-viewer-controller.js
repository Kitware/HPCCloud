angular.module("kitware.cmb.core")
    .controller('CmbViewerController', ['$scope', '$state', '$stateParams', '$window', function ($scope, $state, $stateParams, $window) {
        var hostPort = $window.location.host;
       	hostPort = 'ulex:8080';
        $scope.connectionURL = ($stateParams.mode === 'launcher') ? "/paraview" : "ws://"+hostPort+"/proxy?sessionId=" + $stateParams.sessionId;
        // $scope.connectionURL = 'ws://ulex:8080/ws';
        $scope.itemId = $stateParams.simulationID;

        //cluster / jobId
    }]);
