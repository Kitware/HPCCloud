angular.module("kitware.cmb.core")
    .directive('cmbSimulationInput', ['$templateCache', function ($templateCache) {

        return {
            restrict: 'AE',
            controller: 'cmbSimulationConfigurationController',
            template: $templateCache.get('cmb/core/tpls/cmb-simulation-input.html')
        };
    }]);
