angular.module('pv.web')
   .controller('pvExoMeshViewerController', ['$scope', 'kw.Girder', '$stateParams', '$window', '$templateCache',
         function($scope, $girder, $stateParams, $window, $templateCache) {

      $scope.config = {
         token: $girder.getAuthToken(),
         item: $stateParams.itemID,
         file: $stateParams.fileID
      };

      var itemId = $stateParams.itemID;

      function save(data) {
         $girder.updateItemMetadata({_id: itemId}, {annotation: data});
      }

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
