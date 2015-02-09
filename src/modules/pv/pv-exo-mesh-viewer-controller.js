angular.module('pv.web')
   .controller('pvExoMeshViewerController', ['$scope', 'kw.Girder', '$stateParams', '$window', '$mdDialog', '$templateCache', function($scope, $girder, $stateParams, $window, $mdDialog, $templateCache) {
      var colorPalette = [
               "#76c9fb", "#7d85f8", "#8ff696", "#99b5ad", "#bfad71",
               "#fed50c", "#e8285d", "#fa4627", "#9c37fe", "#1353fe"
               ],
          session = null,
          autobahnConnection = null,
          viewport = null,
          launcher = false;

      $scope.mainVisible = true;

      // return a-b
      function arraySubstract(a, b) {
         var result = [],
            count = a.length;

         while(count--) {
            if(b.indexOf(a[count]) === -1) {
               result.push(a[count]);
            }
         }

         return result;
      }

      function extractUnique(array) {
         var uniqueArray = [],
            count = array.length;

         while(count--) {
            if(uniqueArray.indexOf(array[count]) === -1) {
               uniqueArray.push(array[count]);
            }
         }

         return uniqueArray;
      }

      $scope.$on("$destroy", function() {
         $($window).unbind('resize', render);
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

      function render () {
         if(viewport) {
            try {
               viewport.render();
            } catch(renderError) {
            }
         }
      }

      $girder.getItem($stateParams.itemID)
         .success(function(item) {
            $scope.item = item;
            if(item.meta && item.meta.annotation) {
               $scope.faces = item.meta.annotation;

               var array = $scope.faces,
                  count = array.length;

               while(count--) {
                  array[count].visible = true;
               }
            }
         });

      $scope.connect = function (url) {
         if(url === undefined) {
            url = '/paraview';
         }
         console.log("Try to connect to " + url);
         var configObject = {
            application: 'mesh-viewer',
            token: $girder.getAuthToken(),
            item: $stateParams.itemID,
            file: $stateParams.fileID
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
               viewport = vtkWeb.createViewport({session:connection.session});
               viewport.bind(".hydra-mesh-viewer .renderer");
               viewport.resetCamera();

               function rerender() {
                  viewport.render();
               }

               // Handle window resize
               $($window).bind('resize', render).trigger('resize');

               // Update face list
               session.call('extract.faces', []).then(function(names) {
                  if($scope.faces === undefined) {
                     $scope.faces = [];
                     var size = names.length;
                     for(var i = 0; i < size; ++i) {
                        $scope.faces.push({ visible: true, id: names[i].split('ID:')[1].trim(), name: names[i], tags: [], color: colorPalette[i%colorPalette.length]});
                     }
                  }

                  for(var index = 0; index < $scope.faces.length; ++index) {
                     session.call('toggle.color', [ index, $scope.faces[index].color ]).then(rerender);
                  }
                  $scope.$apply();
               });
            },
            function(code, error) {
               console.log('Autobahn error ' + error);
            });
      };


      function getNextColor (oldColor) {
         var oldIndex = colorPalette.indexOf(oldColor);
         oldIndex++;
         oldIndex = (oldIndex < 0) ? 0 : (oldIndex >= colorPalette.length ? 0 : oldIndex);
         return colorPalette[oldIndex];
      }

      $scope.toggleVisibility = function(index) {
         if(index === -1) {
            $scope.mainVisible = !$scope.mainVisible;
            var count = $scope.faces.length;
            while(count--) {
               $scope.faces[count].visible = $scope.mainVisible;
            }
            session.call('toggle.visibility', [ -1, $scope.mainVisible ]).then(function(){
               viewport.render();
            });
         } else if (index < 0) {
            // Toggle outline
            $scope.outlineVisible = !$scope.outlineVisible;
            session.call('toggle.visibility', [ -2, $scope.outlineVisible ]).then(function(){
               viewport.render();
            });
         } else {
            $scope.faces[index].visible = !$scope.faces[index].visible;
            session.call('toggle.visibility', [ index, $scope.faces[index].visible ]).then(function(){
               viewport.render();
            });
         }
      };

      $scope.toggleBackgroundColor = function () {
         session.call('toggle.bg.color', []).then(function(){
            viewport.render();
         });
      };

      $scope.resetCamera = function () {
         if(viewport) {
            viewport.resetCamera();
         }
      };

      $scope.updateActiveFace = function(index) {
         $scope.activeFace = index;
      };

      $scope.tag = function(event) {
         var projectId = $scope.getActiveProject(),
             collectionName = $scope.collection.name,
             faces = $scope.faces,
             item = $scope.item;

         function saveAnnotation() {
            $girder.updateItemMetadata(item, { annotation: faces });
         }

         $mdDialog.show({
            controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
               var faceList = [], count;

               // Update faces
               for (var idx=0; idx<faces.length; ++idx) {
                  if(faces[idx].visible) {
                     faceList.push(idx);
                  }
               }

               // Update tags
               function isTagShared(name) {
                  console.log(name + ' => ' + faceList);
                  var count = faceList.length;
                  while(count--) {
                     var tags = faces[faceList[count]].tags;
                     if(tags.indexOf(name) === -1) {
                        console.log("==> no");
                        return false;
                     }
                  }
                  console.log("==> ok");
                  return true;
               }

               function extractAllUnionFaceTags() {
                  var count = faceList.length,
                     allTags = [],
                     uniqueTags = [],
                     unionTags = [];

                  // Extract all
                  while(count--) {
                     allTags = allTags.concat(faces[faceList[count]].tags);
                  }

                  // Keep union of tags
                  uniqueTags = extractUnique(allTags);
                  count = uniqueTags.length;
                  while(count--) {
                     if(isTagShared(uniqueTags[count])) {
                        unionTags.push(uniqueTags[count]);
                     }
                  }

                  return unionTags;
               }

               $scope.data = {
                  union: extractAllUnionFaceTags(),
                  faces: faceList.join(', '),
                  tags: extractAllUnionFaceTags().join(', ')
               };

               $scope.updateData = function() {
                  var faceList = [];
                  for (var idx=0; idx<faces.length; ++idx) {
                     if(faces[idx].visible) {
                        faceList.push(idx);
                     }
                  }

                  $scope.data = {
                     union: extractAllUnionFaceTags(),
                     faces: faceList.join(', '),
                     tags: extractAllUnionFaceTags().join(', ')
                  };
               };

               $scope.ok = function(response) {
                   $mdDialog.hide(response);
               };
               $scope.cancel = function() {
                   $mdDialog.cancel();
               };
            }],
            template: $templateCache.get('pv/tpls/pv-mesh-tag-dialog.html'),
            targetEvent: event,
         })
         .then(function(formData) {
            var tags = formData.tags.split(','),
               faceIdx = formData.faces.split(','),
               unionList = formData.union,
               count = 0;

            if(tags.length === 1 && tags[0].trim() === "") {
               tags.pop();
            }

            count = tags.length;
            while(count--) {
               tags[count] = tags[count].trim();
            }

            count = faceIdx.length;
            while(count--) {
               var idx = Number(faceIdx[count].trim()),
                  listToKeep = arraySubstract(faces[idx].tags, unionList);
                  
               faces[idx].tags = listToKeep.concat(tags);
            }

            saveAnnotation();
         }, function() {
         });
      };

      $scope.changeName = function(index, newName) {
         $scope.faces[index].name = newName;
      };

      $scope.changeColor = function(index) {
         $scope.faces[index].color = getNextColor($scope.faces[index].color);
         session.call('toggle.color', [ index, $scope.faces[index].color ]).then(function(){
            viewport.render();
         });
      };

   }]);
