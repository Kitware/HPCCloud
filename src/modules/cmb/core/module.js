angular.module("kitware.cmb.core",["kitware.cmb.core.tpls"])
    .filter('toDateNumber', function() {
        return function(str) {
            if(str === undefined) {
                return 0;
            }
            var day = str.split(' ')[0].split('-'),
                time = str.split(' ')[1].split('.')[0].split(':'),
                args = [].concat(day, time);
            //remember month is 1 based e.g. new Date(2015, 2) -> March 2015
            return new Date(args[0], args[1]-1, args[2], args[3], args[4], args[5]).getTime();
        };
    })
    .filter('bytes', function() {
        return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
        };
    })
    .filter('unescape', function() {
        return function(str) {
            if (!str || str.length === 0) {
                return '';
            } else {
                return unescape(str);
            }
        };
    })
    .directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                        });
                    };
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        };
    }])
    .directive("filemeta", [function () {
        return {
            scope: {
                filemeta: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    scope.$apply(function () {
                        scope.filemeta = changeEvent.target.files[0];
                    });
                });
            }
        };
    }])
    .directive('deltaTime', ['$interval', 'dateFilter', function($interval, dateFilter) {

        function link(scope, element, attrs) {
            var startTime = 0,
                timeoutId;

            function updateTime() {
                var now = Date.now(),
                    deltaHours = (now - startTime)/3600000,
                    hours = Math.floor(deltaHours),
                    minutes = Math.floor(60 * deltaHours) % 60,
                    seconds = Math.floor(3600 * deltaHours) % 60;

                minutes = minutes.toString().length === 1 ? '0' + minutes.toString() : minutes.toString();
                seconds = seconds.toString().length === 1 ? '0' + seconds.toString() : seconds.toString();
                element.text(hours + ':' + minutes + ':' + seconds);
            }

            scope.$watch(attrs.start, function(value) {
                startTime = Number(value);
                updateTime();
            });

            element.on('$destroy', function() {
                $interval.cancel(timeoutId);
            });

            // start the UI update process; save the timeoutId for canceling
            timeoutId = $interval(function() {
              updateTime(); // update DOM
            }, 1000);
        }

        return {
          link: link
        };
    }])
    .directive('loading', function($interval) {
        return {
            restrict: 'A',
            scope: {
                isLoading: '=',
                completeText: '@'
            },
            link: function(scope, element, attrs) {
                var inc,
                    originalText = element.text(),
                    interval = null;

                scope.$on('$destroy', function() {
                    if (interval) {
                        $interval.cancel(interval);
                    }
                });

                scope.$watch('isLoading', function(newVal, oldVal) {
                    if (newVal === false) {
                        $interval.cancel(interval);
                        if (scope.completeText) {
                            element.text(scope.completeText);
                        } else {
                            element.text(originalText);
                        }
                    } else {
                        inc = 0;
                        interval = $interval(animate, 200);
                    }
                });

                function animate() {
                    var elipses = '';
                    for (var i = 0; i < inc; i++) {
                        elipses += '.';
                    }
                    inc = inc >= 3 ? inc = 0 : inc + 1;
                    element.text(originalText + elipses);
                }
            } //close link
        }; //close directive function return
    });
