angular.module('pv.web')
   .controller('pvExoMeshViewerController', ['$rootScope', '$scope', 'kw.Girder', '$stateParams', '$window', '$templateCache',
         function($rootScope, $scope, $girder, $stateParams, $window, $templateCache) {

      var hostPort = $window.location.host;

      $scope.itemId = $stateParams.meshItemId;
      $scope.config = {
         fileId: $stateParams.fileID
      };

      $scope.url = 'ws://'+hostPort+'/proxy?sessionId=' +
         encodeURIComponent($stateParams.sessionId);

      function save(data) {
         $girder.updateItemMetadata({_id: $scope.itemId}, {annotation: data});
      }

      function load(callback) {
         $girder.getItem($scope.itemId)
            .then(function(item) {
               $scope.item = item.data;
               if(item.data.meta && item.data.meta.annotation) {
                  callback(item.data.meta.annotation);
               } else {
                  callback(null);
               }
            }, function(err) {
               console.log(err.data.message);
               callback(null);
            });
      }

      $scope.control = {
         save: save,
         load: load
      };

      $scope.jobStatusDone = $stateParams.done;
      $rootScope.$on('job-status-done', function() {
         $scope.jobStatusDone = true;
      });

      $scope.taskId = $stateParams.taskId;
   }]);
