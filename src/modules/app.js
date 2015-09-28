angular.module('kw.cmb.app', ['ui.router', 'kitware.cmb', 'kitware.SimPut'])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  var goToHome = ["$state", "$scope", function ($state, $scope) {
        if($scope.user !== null) {
            $state.go('home');
        }
    }];


  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/login");

  // Now set up the states
  $stateProvider
    .state('login', {
        url: "/login",
        templateProvider: ['$templateCache', function ($templateCache) {
            return $templateCache.get('cmb/core/tpls/cmb-login-panel.html');
        }],
        controller: goToHome
    })
    .state('register', {
        url: "/register",
        templateProvider: ['$templateCache', function ($templateCache) {
            return $templateCache.get('cmb/core/tpls/cmb-register-panel.html');
        }],
        controller: goToHome
    })
    .state('home', {
        url: "/home",
        templateProvider: ['$templateCache', function ($templateCache) {
            return $templateCache.get('cmb/core/tpls/cmb-home-panel.html');
        }],
        controller:'CmbCollectionsController'
    })
    .state('preferences', {
        url: "/preferences",
        templateProvider: ['$templateCache', function ($templateCache) {
            return $templateCache.get('cmb/core/tpls/cmb-user-prefs.html');
        }],
        controller:'CmbUserPreferencesController'
    })
    .state('projects', {
        url: "/projects/:collectionName",
        templateProvider: ['$templateCache', function ($templateCache) {
            return $templateCache.get('cmb/core/tpls/cmb-workflow-panel.html');
        }],
        controller: 'CmbWorkflowController'
    })
    .state('project', {
        url: "/project/:collectionName/:projectID",
        templateProvider: ['$templateCache', function ($templateCache) {
            return $templateCache.get('cmb/core/tpls/cmb-project-panel.html');
        }],
        controller: 'CmbProjectController'
    })
    .state('simulation', {
        url: "/simulation/:collectionName/:projectID/:simulationID/:mode",
        templateProvider: ['$templateCache', '$stateParams', function ($templateCache, $stateParams) {
            return $templateCache.get($stateParams.collectionName + '/tpls/simulation-' + $stateParams.mode + '.html');
        }],
        controller: 'CmbSimulationController'
    })
    .state('viewer', {
        url: "/viewer/:collectionName/:projectID/:simulationID/:mode",
        templateProvider: ['$templateCache', '$stateParams', function ($templateCache, $stateParams) {
            return $templateCache.get('cmb/core/tpls/cmb-viewer-panel.html');
        }],
        controller: 'CmbViewerController'
    })
    .state('mesh', {
        url: "/mesh/:collectionName/:projectID/:itemID/:fileID",
        templateProvider: ['$templateCache', '$stateParams', function ($templateCache, $stateParams) {
            return $templateCache.get('pv/tpls/pv-exo-mesh-viewer.html');
        }],
        controller: 'pvExoMeshViewerController'
    });
}]);
