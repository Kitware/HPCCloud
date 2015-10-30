angular.module('pv.web')
    .directive('pvJobStatus', ['$rootScope', '$state', '$stateParams', '$templateCache', 'kw.Girder',
        function($rootScope, $state, $stateParams, $templateCache, $girder) {
        return {
            restrict: 'AE',
            template: $templateCache.get('pv/tpls/pv-job-status.html'),
            scope: {
                taskId: '=taskId',
                expectedRunningCount: '=expectedRunningCount',
                itemId: '=?itemId',
                done: '=?' //optional, defaults to false
            },
            link: function(scope, element, attrs) {
                scope.statuses = {}; // formatted {[_id]: 'status', ...}
                scope.jobs = [];
                scope.taskLog = '';
                scope.taskOutput = [];
                scope.itemId = angular.isDefined(scope.itemId) ? scope.itemId : null;
                scope.done = angular.isDefined(scope.done) ? scope.done : false;

                //pass an object and a regex, get an array of keys which match the regex
                function pick(obj, regexp) {
                    return Object.keys(obj).filter(function(el) {
                        return regexp.test(el);
                    });
                }

                function count(obj, attr) {
                    var out = 0;
                    Object.keys(obj).forEach(function(key) {
                        if (obj[key] === attr) {
                            out += 1;
                        }
                    });
                    return out;
                }

                function updateJobsList(taskId, callback) {
                    // console.log('task :: ', tasskId);
                    $girder.getTaskWithId(taskId)
                        .then(function(res) {
                            scope.jobs = [];
                            pick(res.data.output, /_job$/)
                                .forEach(function(el) {
                                    scope.jobs.push(res.data.output[el]);
                                    if (!scope.statuses.hasOwnProperty(res.data.output[el]._id)){
                                        scope.statuses[res.data.output[el]._id] = 'created';
                                    }
                                });
                            if (callback) {
                                callback();
                            }
                        }, function(err) {
                            console.log('error getting task id', err.data.message);
                        });
                }

                function taskFailure(taskId) {
                    scope.activeCollection = $stateParams.collectionName;
                    scope.activeProject = $stateParams.projectID;
                    $girder.getTaskWithId(taskId)
                        .then(function(res) {
                            if (res.data.log.length === 0 || !res.data.log[0].hasOwnProperty('$ref')) {
                                throw new Error('no $ref for task: ' + taskId);
                            } else {
                                return $girder.getTaskLog(res.data.log[0].$ref, 0);
                            }
                        }, function(err) {
                            console.log('error patching task: ', err.data.message);
                        })
                        .then(function(res) { //promise for log fetching
                            var log = res.data.log;
                            for (var i=0; i < log.length; i++) {
                                scope.taskLog += logFormatter(log[i]);
                            }
                            if (scope.itemId !== null) {
                                return $girder.listItemFiles(scope.itemId);
                            } else {
                                throw new Error('no item to fetch output from');
                            }
                        }, function(err) {
                            if (err instanceof Error) { //might be the error thrown above.
                                console.log(err.message);
                            } else {
                                console.log('error fetching task log: ', err.data.message);
                            }
                            scope.fail = true;
                        })
                        .then(function(res) { //promise for listing itemFiles
                            console.log('itemFiles? ', res.data);
                            if (res && res.hasOwnProperty('data')) {
                                scope.taskOutput = res.data;
                            }
                        }, function(err) {
                            if (err instanceof Error) {
                                console.log(err.message);
                            } else {
                                console.log('error fetching item files: ', err.data.message);
                            }
                        });
                }

                function logFormatter(l) {
                    return '[' + formatTime(l.created) + '] ' + l.levelname + ': ' + l.msg + '\n';
                }

                function formatTime(time) {
                    var date = new Date(time),
                        hours = date.getHours().toString(),
                        minutes = date.getMinutes().toString(),
                        seconds = date.getSeconds().toString(),
                        ms = date.getMilliseconds().toString();

                    hours = hours.length === 1 ? '0' + hours : hours;
                    minutes = minutes.length === 1 ? '0' + minutes : minutes;
                    seconds = seconds.length === 1 ? '0' + seconds : seconds;
                    if (ms.length < 3) {
                        while(ms.length < 3) {
                            ms = '0' + ms;
                        }
                    }

                    return hours + ':' + minutes + ':' + seconds + '.' + ms;
                }

                //fetch the task incase there are any new jobs, update jobs scope.statuses
                scope.$on('job.status', function(event, data) {
                    function cb() {
                        scope.statuses[data._id] = data.status;
                        //if all the jobs are running, we're done here.
                        if (count(scope.statuses, 'running') === scope.expectedRunningCount) {
                            scope.done = true;
                            $rootScope.$broadcast('job-status-done');
                        } else if (data.status === 'error') {
                            // alert('job has errored');
                            $girder.updateFolderMetadata($stateParams.projectID, {status: 'failure'});
                            $scope.project.meta.status = 'failure';
                            taskFailure(scope.taskId);
                        } else if (data.status === 'complete') {
                            // alert('job already completed');
                            $girder.updateFolderMetadata($stateParams.projectID, {status: 'failure'});
                            $scope.project.meta.status = 'failure';
                            taskFailure(scope.taskId);
                        }
                    }
                    updateJobsList(scope.taskId, cb);
                });

                //update the jobs list it the event has the right taskId
                scope.$on('task.status', function(event, data) {
                    if (data._id === scope.taskId && !(data.status === 'error' || data.status === 'failure')) {
                        updateJobsList(scope.taskId);
                    }
                });
            }
         };
    }]);