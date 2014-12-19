angular.module('kw.cmb.app', ['ui.router', 'kitware.cmb'])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  var annonymousGoToLogin = ["$state", "$scope", function ($state, $scope) {if($scope.user === null) {$state.go('login');}}],
    goToHome = ["$state", "$scope", function ($state, $scope) {if($scope.user !== null) {$state.go('home');}}];


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
    .state('projects', {
        url: "/projects/:collectionID",
        templateProvider: ['$templateCache', function ($templateCache) {
            return $templateCache.get('cmb/core/tpls/cmb-workflow-panel.html');
        }],
        controller: 'CmbWorkflowController'
    })
    .state('project', {
        url: "/project/:collectionID/:projectID",
        template: "Inside a project",
        controller: annonymousGoToLogin
    });
}]);
