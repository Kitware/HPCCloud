angular.module('pv.web')
   .controller('pvExoMeshViewerController', ['$rootScope', '$scope', 'kw.Girder', '$stateParams', '$window', '$templateCache',
         function($rootScope, $scope, $girder, $stateParams, $window, $templateCache) {

      $scope.config = {
         fileId: $stateParams.fileID
      };

      var itemId = $stateParams.meshItemId,
         hostPort = $window.location.host;

      $scope.url = "ws://"+hostPort+"/proxy?sessionId=" +
         encodeURIComponent($stateParams.sessionId);

      function save(data) {
         $girder.updateItemMetadata({_id: itemId}, {annotation: data});
      }

      //itemID: meshItem._id, fileID: mesh._id

      function load(callback) {
         $girder.getItem(itemId)
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

      $scope.status = 'loading';
      $rootScope.$on('job.status', function(event, data) {
         $scope.status = data.status;
         $scope.$apply();
      });

   }]);
