angular.module("kitware.cmb.core")
    .controller('CmbViewerController', ['$rootScope', '$scope', '$stateParams', '$window',
        function ($rootScope, $scope, $stateParams, $window) {
        var hostPort = $window.location.host;
        $scope.connectionURL = ($stateParams.mode === 'launcher') ? "/paraview" : ("ws://"+hostPort+"/proxy?sessionId=" + encodeURIComponent($stateParams.sessionId));
        $scope.itemId = $stateParams.simulationID;

        $scope.jobStatusDone = false;
        $rootScope.$on('job-status-done', function() {
            $scope.jobStatusDone = true;
        });
    }]);
