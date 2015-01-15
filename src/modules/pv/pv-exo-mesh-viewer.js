angular.module('pv.web')
   .directive('pvExoMeshViewer', ['$templateCache', function($templateCache) {
      return {
         restrict: 'AE',
         scope: {
            url: '@',
            item: '@'
         },
         controller: ['$scope', 'kw.Girder', function($scope, $girder) {
            var session = null,
               autobahnConnection = null,
               viewport = null,
               launcher = false;

            $scope.$on("$destroy", function() {
               if(session) {
                  console.log("close PVWeb client");
                  var connectionToDelete = autobahnConnection;
                  if(launcher) {
                     session.call('application.exit.later', [ 5 ]).then(function(){
                        try {
                           connectionToDelete.close();
                        } catch (closeError) {
                        }
                     });
                  } else {
                     try {
                        connectionToDelete.close();
                     } catch (closeError) {
                     }
                  }
                  session = null;
                  autobahnConnection = null;
                  viewport = null;
               }
            });

         $scope.connect = function (url) {
            console.log("Try to connect to " + url);

               var configObject = {
                  application: 'mesh-viewer',
                  token: $girder.getAuthToken(),
                  itemId: $scope.item
               };
               if(url.indexOf("ws") === 0) {
                  configObject.sessionURL = url;
               } else {
                  launcher = true;
                  configObject.sessionManagerURL = url;
               }
               vtkWeb.smartConnect(configObject,
                  function(connection) {
                     autobahnConnection = connection.connection;
                     session = connection.session;

                     $('.app-wait-start-page').remove();
                     $('.hide-on-start').removeClass('hide-on-start');

                     pv.initializeVisualizer( session, '.pv-viewport',
                                             '.pv-pipeline', '.pv-proxy-editor',
                                             '.pv-files', '.pv-source-list',
                                             '.pv-filter-list', '.pv-data-info');
                  },
                  function(code, error) {
                     console.log('Autobahn error ' + error);
                  });
            };
         }],
         template: $templateCache.get('pv/tpls/pv-web-visualizer.html')
       };
   }]);
