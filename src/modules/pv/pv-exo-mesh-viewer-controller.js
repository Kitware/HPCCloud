angular.module('pv.web')
   .controller('pvExoMeshViewerController', ['$scope', 'kw.Girder', '$stateParams', '$window', '$templateCache',
         function($scope, $girder, $stateParams, $window, $templateCache) {

      $scope.config = {
         fileId: $stateParams.fileID
      };

      var itemId = $stateParams.meshItemID,
         hostPort = $window.location.host;

      hostPort = 'ulex';
      $scope.url = "ws://"+hostPort+"/proxy?sessionId=" +
         encodeURIComponent($stateParams.sessionId);

      function save(data) {
         $girder.updateItemMetadata({_id: itemId}, {annotation: data});
      }

      //itemID: meshItem._id, fileID: mesh._id

      function load(callback) {
         $girder.getItem(itemId)
            .success(function(item) {
               $scope.item = item;
               if(item.meta && item.meta.annotation) {
                  callback(item.meta.annotation);
               }
            });
      }

      $scope.control = {
         save: save,
         load: load
      };

   }]);
