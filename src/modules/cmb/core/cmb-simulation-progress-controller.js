angular.module("kitware.cmb.core")
.controller('CmbSimulationProgressController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$http', '$timeout', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $http, $timeout) {

    $scope.refresh = function () {
        $scope.data = sinAndCos();
    };

    $scope.options = {
        chart: {
            type: 'lineChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 40,
                left: 60
            },
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            useInteractiveGuideline: true,
            dispatch: {
                // stateChange: function(e){ console.log("stateChange"); },
                // changeState: function(e){ console.log("changeState"); },
                // tooltipShow: function(e){ console.log("tooltipShow"); },
                // tooltipHide: function(e){ console.log("tooltipHide"); }
            },
            xAxis: {
                axisLabel: 'Time (ms)'
            },
            yAxis: {
                axisLabel: 'Voltage (v)',
                tickFormat: function(d){
                    return d3.format('.02f')(d);
                },
                axisLabelDistance: 30
            },
            callback: function(chart){
                // console.log("!!! lineChart callback !!!");
            }
        },
        title: {
            enable: true,
            text: 'Title for Line Chart'
        }
    };

    $scope.data = sinAndCos();

    /*Random Data Generator */
    function sinAndCos() {
        var sin = [],
            sin2 = [],
            cos = [];

        console.log("run sinAndCos");

        //Data is represented as an array of {x,y} pairs.
        for (var i = 0; i < 100; i++) {
            r = Math.random() / 10;
            sin.push({x: i, y: Math.sin(i/10) + r });
            sin2.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) *0.25 + 0.5 + r});
            cos.push({x: i, y: 0.5 * Math.cos(i/10+ 2) + r});
        }

        //Line chart data should be sent as an array of series objects.
        return [{
                values: sin,      //values - represents the array of {x,y} data points
                key: 'Sine Wave', //key  - the name of the series.
                color: '#ff7f0e'  //color - optional: choose your own line color.
            },
            {
                values: cos,
                key: 'Cosine Wave',
                color: '#2ca02c'
            },
            {
                values: sin2,
                key: 'Another sine wave',
                color: '#7777ff',
                area: true      //area - set to true if you want this line to turn into a filled area chart.
            }
            ];
    }

    if($girder.getUser() === null) {
        $state.go('login');
    }
}]);
