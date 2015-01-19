angular.module("kitware.cmb.core")
.controller('CmbSimulationProgressController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$http', '$interval', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $http, $interval) {
    var timoutId = 0;

    $scope.outputStats = "";
    $scope.jobId = null;

    function updateOutput() {
       if($scope.jobId) {
            console.log('got jobId');
            var offset = $scope.outputStats.split('\n').length;

            // Get delta content
            // FIXME path should be given base on the Workflow
            $girder.getJobOutput(jobId, 'output/stat.txt', offset)
                .success(function(deltaContent) {
                    console.log(deltaContent);
                    $scope.outputStats += deltaContent;
                })
                .error(function(err){
                    console.log(err);
                });
        } else if($scope.simulation) {
            console.log('got simulation');
            $girder.getTask($scope.simulation)
                .success(function(task){
                    console.log(task);
                    if(task && task.output && task.output.hydra_job) {
                        $scope.jobId = task.output.hydra_job._id;
                        console.log('got id');
                    }
                })
                .error(function(err){
                    console.log(err);
                });
        } else {
            console.log('no job id or simulation');
        }
    }

    $scope.refresh = function () {
        updateOutput();
    };

    timeoutId = $interval(updateOutput, 30000);

    $scope.$on('$destroy', function() {
        $interval.cancel(timeoutId);
    });

    if($girder.getUser() === null) {
        $state.go('login');
    }
}]);
