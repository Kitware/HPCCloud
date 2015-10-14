angular.module("kitware.cmb.core")
.controller('CmbSimulationProgressController', ['$scope', 'kw.Girder', '$state', '$stateParams',
    '$mdDialog', '$templateCache', '$interval',
    function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $interval) {
    var timoutId = 0;

    $scope.outputStats = [];
    $scope.jobId = null;

    function updateOutput() {
       if($scope.jobId) {
            var offset = $scope.outputStats.length;

            // Get delta content
            // FIXME path should be given base on the Workflow
            $girder.getJobOutput($scope.jobId, 'output/stat.txt', offset)
                .success(function(deltaContent) {
                    var lines = deltaContent.content,
                        idx = 0,
                        count = lines.length;

                    if($scope.outputStats.length === 0) {
                        idx = 1;
                    }

                    while(idx < count) {
                        var line = lines[idx].replace(/ +/g, ' ')
                            .replace(/RMS Div/g, 'RMS-Div')
                            .replace(/# /g, '').split(' ');
                        $scope.outputStats.push(line);

                        // Next line
                        ++idx;
                    }
                })
                .error(function(err){
                    console.log(err);
                });
        } else if($scope.simulation && $scope.simulation.meta.task && $scope.simulation.meta.task !== 'completed') {
            $girder.getTask($scope.simulation)
                .success(function(task){
                    if(task && task.output && task.output.hydra_job) {
                        $scope.jobId = task.output.hydra_job._id;
                        updateOutput();
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

    if(!girder.getAuth()) {
        $state.go('login');
    }
}]);
