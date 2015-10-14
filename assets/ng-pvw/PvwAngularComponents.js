/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["PvwAngularComponents"] = __webpack_require__(1);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	var angular = __webpack_require__(2),
	    meshTagger = __webpack_require__(3),
	    visualizer = __webpack_require__(13),
	    moduleName = 'pvweb-module';

	exports['default'] = moduleName;

	angular.module(moduleName, [meshTagger, visualizer]);
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = angular;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	__webpack_require__(4);

	var angular = __webpack_require__(2),
	    angularMaterial = __webpack_require__(8),
	    vtkWeb = __webpack_require__(9),
	    $ = __webpack_require__(10),
	    moduleName = 'pvwMeshTaggerModule',
	    controllerName = 'pvwMeshTaggerController',
	    directiveName = 'pvwMeshTagger';

	exports['default'] = moduleName;

	angular.module(moduleName, [angularMaterial]).directive(directiveName, function () {
	    return {
	        scope: {
	            url: '=',
	            appKey: '@appkey',
	            state: '=',
	            config: '=',
	            fileToLoad: '=loadfile'
	        },
	        template: __webpack_require__(11),
	        replace: true,
	        controller: controllerName
	    };
	}).controller(controllerName, ['$scope', '$window', '$mdDialog', '$timeout', function ($scope, $window, $mdDialog, $timeout) {

	    // Some internal variables that do not need to be attached to the $scope
	    var autobahnConnection = null,
	        viewport = null,
	        colorPalette = ["#76c9fb", "#7d85f8", "#8ff696", "#99b5ad", "#bfad71", "#fed50c", "#e8285d", "#fa4627", "#9c37fe", "#1353fe"],
	        session = null,
	        launcher = false,
	        stateLoaded = false;

	    $scope.showingControlTab = true;
	    $scope.outlineVisible = true;
	    $scope.showingFaces = true;
	    $scope.activeElement = 0;

	    $scope.faces = [];
	    $scope.blocks = [];

	    function setBusy() {
	        $('.busy-spinner-indicator').css('display', 'block');
	    }

	    function unsetBusy() {
	        $('.busy-spinner-indicator').css('display', 'none');
	    }

	    function rerender() {
	        viewport.render(function () {
	            unsetBusy();
	        });
	    }

	    $scope.connect = function (url, appKey) {
	        if (url === undefined) {
	            url = '/paraview';
	        }

	        var configObject = {
	            application: appKey,
	            fileToLoad: $scope.fileToLoad
	        };
	        angular.extend(configObject, $scope.config);

	        if (url.indexOf("ws") === 0) {
	            configObject.sessionURL = url;
	        } else {
	            launcher = true;
	            configObject.sessionManagerURL = url;
	        }

	        vtkWeb.smartConnect(configObject, function (connection) {
	            autobahnConnection = connection.connection;
	            session = connection.session;
	            viewport = vtkWeb.createViewport({ session: connection.session });
	            viewport.bind(".hydra-mesh-viewer .renderer");
	            viewport.resetCamera();

	            // Handle window resize
	            $window.onresize = rerender;

	            // Try to load a previous tagging state
	            if ($scope.state) {
	                stateLoaded = true;
	                $scope.state.load(function (myState) {
	                    if (myState.hasOwnProperty('faces')) {
	                        $scope.faces = angular.copy(myState.faces);
	                        $scope.elements = $scope.faces;
	                    }
	                    if (myState.hasOwnProperty('blocks')) {
	                        $scope.blocks = myState.blocks;
	                    }
	                    stateLoaded = false;
	                    unsetBusy();
	                });
	            }

	            // Take the faces and blocks and color each one according to it's internal color property
	            function setupColoring() {
	                var totalNumberOfElements = $scope.faces.length + $scope.blocks.length,
	                    currentlyRecoloredCount = 0;

	                function rerenderAfterAll() {
	                    currentlyRecoloredCount += 1;
	                    if (currentlyRecoloredCount === totalNumberOfElements) {
	                        rerender();
	                    }
	                }

	                function initColors(scopeArray, type, updateLut) {
	                    for (var index = 0; index < scopeArray.length; ++index) {
	                        session.call('toggle.color', [type, index, scopeArray[index].color, updateLut]).then(rerenderAfterAll);
	                    }
	                }

	                initColors($scope.blocks, 'blocks', false);
	                initColors($scope.faces, 'faces', true);

	                $scope.elements = $scope.faces;
	                $scope.$apply();
	            }

	            // Get faces and blocks lists from the server if we don't have them already.
	            if (stateLoaded === false) {
	                (function () {
	                    var acquireElements = function acquireElements(scopeArray, subsetArray) {
	                        var size = subsetArray.length;
	                        for (var i = 0; i < size; ++i) {
	                            var elt = subsetArray[i];
	                            scopeArray.push({
	                                visible: elt.visible,
	                                id: elt.id,
	                                name: elt.name,
	                                tags: [],
	                                color: colorPalette[i % colorPalette.length]
	                            });
	                        }
	                    };

	                    setBusy();
	                    session.call('extract.subsets', []).then(function (subsets) {
	                        acquireElements($scope.faces, subsets.faces);
	                        acquireElements($scope.blocks, subsets.blocks);
	                        setupColoring();
	                    });
	                })();
	            } else {
	                // If we did receive stored state, then just color the faces and blocks
	                setBusy();
	                setupColoring();
	            }
	        }, function (code, error) {
	            console.log('Autobahn error ' + error);
	        });
	    };

	    $scope.toggleControlTab = function () {
	        $scope.showingControlTab = !$scope.showingControlTab;
	        $('.control-tab').toggleClass('open closed');
	        if ($scope.showingControlTab) {
	            $('.hydra-mesh-viewer > .control-panel').css('border-radius', '5px 5px 0 0');
	        } else {
	            $('.hydra-mesh-viewer > .control-panel').css('border-radius', '5px');
	        }
	    };

	    $scope.toggleVisibility = function (index) {
	        setBusy();
	        if (index === -1) {
	            // Toggle outline
	            $scope.outlineVisible = !$scope.outlineVisible;
	            session.call('toggle.visibility', [-1, $scope.outlineVisible]).then(function () {
	                rerender();
	            });
	        } else if (index < 0 && $scope.elements.length) {
	            var count = $scope.elements.length,
	                allVisible = index === -2 ? true : false;
	            while (count--) {
	                $scope.elements[count].visible = allVisible;
	            }
	            session.call('toggle.visibility', [-2, allVisible]).then(function () {
	                rerender();
	            });
	        } else {
	            $scope.elements[index].visible = !$scope.elements[index].visible;
	            session.call('toggle.visibility', [index, $scope.elements[index].visible]).then(function () {
	                rerender();
	            });
	        }
	    };

	    $scope.toggleElementType = function () {
	        setBusy();
	        $timeout(function () {
	            $scope.showingFaces = !$scope.showingFaces;

	            if ($scope.showingFaces) {
	                $scope.elements = $scope.faces;
	            } else {
	                $scope.elements = $scope.blocks;
	            }

	            session.call('set.showing.elements', [$scope.showingFaces]).then(function () {
	                rerender();
	            });
	        }, 20);
	    };

	    $scope.updateActiveElement = function (index) {
	        $scope.activeElement = index;
	    };

	    function getNextColor(oldColor) {
	        var oldIndex = colorPalette.indexOf(oldColor);
	        oldIndex++;
	        oldIndex = oldIndex < 0 ? 0 : oldIndex >= colorPalette.length ? 0 : oldIndex;
	        return colorPalette[oldIndex];
	    }

	    $scope.changeColor = function (index) {
	        setBusy();
	        $scope.elements[index].color = getNextColor($scope.elements[index].color);
	        session.call('toggle.color', ['faces', index, $scope.elements[index].color, true]).then(function () {
	            rerender();
	        });
	    };

	    $scope.resetCamera = function () {
	        if (viewport) {
	            setBusy();
	            viewport.resetCamera();
	            unsetBusy();
	        }
	    };

	    $scope.toggleBackgroundColor = function () {
	        setBusy();
	        session.call('toggle.bg.color', []).then(function (newBgColor) {
	            console.log("New background color:");
	            console.log(newBgColor);
	            if (newBgColor[0] < 0.5) {
	                $('.busy-spinner-indicator').css('color', 'white');
	                $('.hydra-mesh-viewer > .control-panel').css('background-color', '#aaaaaa').css('color', 'black');
	                $('.hydra-mesh-viewer > .control-tab.open').css('border', 'none');
	            } else {
	                $('.busy-spinner-indicator').css('color', 'black');
	                $('.hydra-mesh-viewer > .control-panel').css('background-color', '#444444').css('color', 'white');
	                if (Math.abs(newBgColor[0] - 1.0) <= 0.000001) {
	                    $('.hydra-mesh-viewer > .control-tab.open').css('border', '1px solid gray');
	                } else {
	                    $('.hydra-mesh-viewer > .control-tab.open').css('border', 'none');
	                }
	            }
	            rerender();
	        });
	    };

	    $scope.tag = function (event) {
	        var elements = $scope.elements,
	            dialogTitle = $scope.showingFaces ? "Tag Mesh Faces" : "Tag Mesh Blocks",
	            elementInputLabel = $scope.showingFaces ? "List of faces" : "List of blocks";

	        function saveAnnotation() {
	            $scope.state.save({
	                faces: $scope.faces,
	                blocks: $scope.blocks
	            });
	        }

	        // return a-b
	        function arraySubtract(a, b) {
	            var result = [],
	                count = a.length;

	            while (count--) {
	                if (b.indexOf(a[count]) === -1) {
	                    result.push(a[count]);
	                }
	            }

	            return result;
	        }

	        function extractUnique(array) {
	            var uniqueArray = [],
	                count = array.length;

	            while (count--) {
	                if (uniqueArray.indexOf(array[count]) === -1) {
	                    uniqueArray.push(array[count]);
	                }
	            }

	            return uniqueArray;
	        }

	        $mdDialog.show({
	            controller: ['$scope', '$mdDialog', function ($scope, $mdDialog) {
	                var indexList = [],
	                    elementList = [],
	                    count;

	                // Update elements
	                for (var idx = 0; idx < elements.length; ++idx) {
	                    if (elements[idx].visible) {
	                        indexList.push(idx);
	                        elementList.push(elements[idx].id);
	                    }
	                }

	                // Update tags
	                function isTagShared(name) {
	                    console.log(name + ' => ' + indexList);
	                    var count = indexList.length;
	                    while (count--) {
	                        var tags = elements[indexList[count]].tags;
	                        if (tags.indexOf(name) === -1) {
	                            console.log("==> no");
	                            return false;
	                        }
	                    }
	                    console.log("==> ok");
	                    return true;
	                }

	                function extractAllUnionFaceTags() {
	                    var count = indexList.length,
	                        allTags = [],
	                        uniqueTags = [],
	                        unionTags = [];

	                    // Extract all
	                    while (count--) {
	                        allTags = allTags.concat(elements[indexList[count]].tags);
	                    }

	                    // Keep union of tags
	                    uniqueTags = extractUnique(allTags);
	                    count = uniqueTags.length;
	                    while (count--) {
	                        if (isTagShared(uniqueTags[count])) {
	                            unionTags.push(uniqueTags[count]);
	                        }
	                    }

	                    return unionTags;
	                }

	                $scope.data = {
	                    title: dialogTitle,
	                    elementInputLabel: elementInputLabel,
	                    union: extractAllUnionFaceTags(),
	                    indices: indexList,
	                    ids: elementList.join(', '),
	                    tags: extractAllUnionFaceTags().join(', ')
	                };

	                $scope.ok = function (response) {
	                    $mdDialog.hide(response);
	                };
	                $scope.cancel = function () {
	                    $mdDialog.cancel();
	                };
	            }],
	            template: __webpack_require__(12),
	            targetEvent: event
	        }).then(function (formData) {
	            var tags = formData.tags.split(','),
	                eltIndices = formData.indices,
	                unionList = formData.union,
	                count = 0;

	            if (tags.length === 1 && tags[0].trim() === "") {
	                tags.pop();
	            }

	            count = tags.length;
	            while (count--) {
	                tags[count] = tags[count].trim();
	            }

	            count = eltIndices.length;
	            while (count--) {
	                var idx = eltIndices[count],
	                    listToKeep = arraySubtract(elements[idx].tags, unionList);

	                elements[idx].tags = listToKeep.concat(tags);
	            }

	            saveAnnotation();
	        }, function () {});
	    };

	    $scope.$on("$destroy", function () {
	        session.call('application.exit.later', []).then(function () {
	            autobahnConnection.close();
	        });
	    });

	    $scope.connect($scope.url, $scope.appKey);
	}]);
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/autoprefixer-loader/index.js?browsers=last 2 version!./style.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/autoprefixer-loader/index.js?browsers=last 2 version!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, ".hydra-mesh-viewer {\n    position: absolute;\n    left: 0;\n    right: 0;\n    top: 0;\n    bottom: 0;\n}\n\n.hydra-mesh-viewer > .control-panel {\n    position: absolute;\n    top: 30px;\n    left: 30px;\n    z-index: 50;\n    border-radius: 5px 5px 0 0;\n    color: black;\n    background-color: #aaaaaa;\n    width: 350px;\n    height: 32px;\n}\n\n.hydra-mesh-viewer > .control-panel > div > div.faces-blocks-label {\n    font-family: sans-serif;\n    font-size: larger;\n}\n\n.hydra-mesh-viewer > .control-panel > span {\n    text-align: center;\n    margin: 2px;\n}\n\n.hydra-mesh-viewer > .control-panel > span.left {\n    float: left;\n}\n\n.hydra-mesh-viewer > .control-panel > span.right {\n    float: right;\n}\n\n.hydra-mesh-viewer > .control-tab.open {\n    position: absolute;\n    left: 30px;\n    top: 62px;\n    width: 350px;\n    bottom: 30px;\n    display: block;\n    border-radius: 0 0 5px 5px;\n    background-color: white;\n    z-index: 50;\n    overflow-x: hidden;\n    overflow-y: auto;\n}\n\n.hydra-mesh-viewer > .control-tab.closed {\n    display: none;\n}\n\n.hydra-mesh-viewer > .renderer {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n.hydra-mesh-viewer > .width-100 {\n    width: 100%;\n}\n\n.busy-spinner-container {\n    position: absolute;\n    left: 56%;\n    top: 45%;\n}\n\n.busy-spinner-indicator {\n    display: none;\n    color: white;\n}\n\n.clickable {\n    cursor: pointer;\n}\n", ""]);

	// exports


/***/ },
/* 6 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = 'ngMaterial';

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = vtkWeb;

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = "<div class=\"hydra-mesh-viewer\">\n   <div class=\"control-tab open\">\n      <table class='table table-striped table-hover table-condensed'>\n         <tbody>\n            <tr ng-repeat=\"elt in elements\" ng-class=\"{ info: ($index === activeElement)}\" ng-click=\"updateActiveElement( $index)\">\n               <td ng-click=\"toggleVisibility($index)\"><i class=\"fa\" ng-class=\"{ 'fa-eye' : elt.visible, 'fa-eye-slash': !elt.visible }\"></i></td>\n               <td>{{ elt.name }}</td>\n               <td>\n                  <div class=\"fa\" ng-class=\"{ 'fa-tags' : elt.tags.length > 0}\">\n                     <md-tooltip>{{ elt.tags.join(', ') }}</md-tooltip>\n                  </div>\n               </td>\n               <td style=\"color: {{ elt.color }};\" ng-click=\"changeColor($index)\"><i class=\"fa fa-circle clickable\"></i></td>\n            </tr>\n         </tbody>\n      </table>\n   </div>\n   <div class=\"control-panel\">\n      <span class=\"fa-stack fa left clickable\" ng-click=\"toggleControlTab()\">\n         <i class=\"fa fa-stack-1x\" ng-class=\"{ 'fa-caret-down': showingControlTab, 'fa-caret-right': !showingControlTab }\">\n            <md-tooltip>Toggle Element List</md-tooltip>\n         </i>\n      </span>\n      <div class=\"fa-stack fa\" style=\"position: relative; margin-top: 3px; width: 55px; float: left\">\n         <div class=\"faces-blocks-label left clickable\" ng-click=\"toggleElementType()\">\n            {{ showingFaces ? \"Faces\" : \"Blocks\" }}\n         </div>\n         <md-tooltip>Display {{ showingFaces ? \"Block\" : \"Face\" }} List</md-tooltip>\n      </div>\n      <span class=\"fa-stack fa right clickable\" ng-click=\"tag($event)\">\n         <i class=\"fa fa-tags fa-stack-1x\">\n            <md-tooltip>Tag Visible {{ showingFaces ? \"Faces\" : \"Blocks\" }}</md-tooltip>\n         </i>\n      </span>\n      <span class=\"fa-stack fa right clickable\" ng-click=\"resetCamera()\">\n         <i class=\"fa fa-arrows-alt fa-stack-1x\">\n            <md-tooltip>Reset Camera</md-tooltip>\n         </i>\n      </span>\n      <span class=\"fa-stack fa right clickable\" ng-click=\"toggleVisibility(-1)\">\n         <i class=\"fa fa-cube fa-stack-1x\">\n            <md-tooltip>Toggle Outline Visibility</md-tooltip>\n         </i>\n      </span>\n      <span class=\"fa-stack fa right clickable\" ng-click=\"toggleBackgroundColor()\">\n         <i class=\"fa fa-paint-brush fa-stack-1x\">\n            <md-tooltip>Toggle Background Color</md-tooltip>\n         </i>\n      </span>\n      <span class=\"fa-stack fa right clickable\" ng-click=\"toggleVisibility(-2)\">\n         <i class=\"fa fa-eye fa-stack-1x\">\n            <md-tooltip>Show All {{ showingFaces ? \"Faces\" : \"Blocks\" }}</md-tooltip>\n         </i>\n      </span>\n      <span class=\"fa-stack fa right clickable\" ng-click=\"toggleVisibility(-3)\">\n         <i class=\"fa fa-eye-slash fa-stack-1x\">\n            <md-tooltip>Hide All {{ showingFaces ? \"Faces\" : \"Blocks\" }}</md-tooltip>\n         </i>\n      </span>\n   </div>\n   <div class=\"renderer\">\n   </div>\n   <div class=\"busy-spinner-container\">\n      <i class=\"fa fa-spinner fa-5x fa-spin busy-spinner-indicator\"></i>\n   </div>\n</div>"

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = "<md-dialog aria-label=\"Tag mesh\" style=\"width: 50%;\">\n<md-subheader class=\"md-sticky-no-effect cmb-subheader\">\n  <div layout=\"row\">\n    <strong title>{{ data.dialogTitle }}</strong>\n    <span flex></span>\n    <span class=\"fa fa-close\" ng-click=\"cancel()\" style=\"padding: 0 16px 0 0;\">\n    </span>\n  </div>\n</md-subheader>\n<md-content layout=\"row\">\n    <form layout=\"column\" flex>\n        <md-input-container class=\"width-100\" flex><label>{{ data.elementInputLabel }}</label><input ng-model=\"data.ids\"></md-input-container>\n        <md-input-container class=\"width-100\" flex><label>List of tags</label><input ng-model=\"data.tags\"></md-input-container>\n    </form>\n</md-content>\n  <div class=\"md-actions\" layout=\"row\">\n    <span flex></span>\n    <md-button ng-click=\"ok(data)\" class=\"md-raised md-primary\">Save</md-button>\n    <md-button ng-click=\"cancel()\" class=\"md-raised md-warn\">Cancel</md-button>\n  </div>\n</md-dialog>\n"

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	   value: true
	});

	__webpack_require__(14);

	var angular = __webpack_require__(2),
	    vtkWeb = __webpack_require__(9),
	    $ = __webpack_require__(10),
	    pv = __webpack_require__(18),
	    moduleName = 'pvwVisualizerModule',
	    controllerName = 'pvwVisualizerController',
	    directiveName = 'pvwVisualizer';

	exports['default'] = moduleName;

	angular.module(moduleName, []).directive(directiveName, function () {
	   return {
	      scope: {
	         url: '@url',
	         appKey: '@appkey'
	      },
	      template: __webpack_require__(19),
	      replace: true,
	      controller: controllerName
	   };
	}).controller(controllerName, ['$scope', function ($scope) {

	   // Some internal variables that do not need to be attached to the $scope
	   var autobahnConnection = null,
	       session = null,
	       launcher = false;

	   $scope.connect = function (url, appKey) {
	      if (url === undefined) {
	         url = '/paraview';
	      }

	      var configObject = {
	         application: appKey
	      };

	      if (url.indexOf("ws") === 0) {
	         configObject.sessionURL = url;
	      } else {
	         launcher = true;
	         configObject.sessionManagerURL = url;
	      }

	      vtkWeb.smartConnect(configObject, function (connection) {
	         autobahnConnection = connection.connection;
	         session = connection.session;

	         $('.app-wait-start-page').remove();
	         $('.hide-on-start').removeClass('hide-on-start');

	         pv.initializeVisualizer(session, '.pv-viewport', '.pv-pipeline', '.pv-proxy-editor', '.pv-files', '.pv-source-list', '.pv-filter-list', '.pv-data-info', '.pv-global-settings-editor', '.pv-savedata-options');

	         $('[data-toggle="tooltip"]').tooltip({ container: '.pv-visualizer-app' });
	      }, function (code, error) {
	         console.log('Autobahn error ' + error);
	      });
	   };

	   $scope.$on("$destroy", function () {
	      session.call('application.exit.later', []).then(function () {
	         autobahnConnection.close();
	      });
	   });

	   $scope.connect($scope.url, $scope.appKey);
	}]);
	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(15);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/autoprefixer-loader/index.js?browsers=last 2 version!./main.css", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/autoprefixer-loader/index.js?browsers=last 2 version!./main.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "/* ---- Visualizer specific ----- */\n\n.pvw-logo-button {\n    position: relative;\n    background: url(" + __webpack_require__(16) + ");\n    background-repeat: no-repeat;\n    padding: 10px;\n    background-position: 50% 54%;\n    left: -4px;\n}\n\n.pvw-startup-logo {\n    position: relative;\n    background: url(" + __webpack_require__(17) + ");\n    background-repeat: no-repeat;\n    background-position: center;\n    background-size: 25%;\n    height: 200px;\n}\n\n.bar-height { height: 26px; }\n.head-toolbar span { position: relative; top: 2px; font-size: 16px; }\n.fix-height { position: relative; top: 0; left: 0; }\n.pv-time-input { position: relative; width: 80px; border: solid 1px white; background: none; padding: 1px 10px; }\n\n.active-data-type-label { font-style: italic; }\n\n/* ---- Sources/Filters Icons ---- */\n\n.pv-source-list ul, .pv-filter-list ul {\n    margin-bottom: 0;\n}\n.pvActionList li:before {\n  font-family: \"fontello\";\n  width: 16px;\n  display: inline-block;\n}\n.pv-source-list li:before { content: '\\E94E'; }\n.pv-filter-list li:before { content: '\\E81C'; }\n\n/* ---- Font - colors - Cursor ----- */\n\n.clickable { cursor: pointer; -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; }\n\n.pv-h4-font { font-size: 16px }\n\n.pv-gray-darker  { background: #222; color: #eee; }\n.pv-gray-dark    { background: #333; color: #eee; }\n.pv-gray         { background: #555; color: #eee; }\n.pv-gray-light   { background: #777; color: #eee; }\n.pv-gray-lighter { background: #eee; color: #000; }\n\n.pv-gray-lighter-transparent { background: rgba(238,238,238,0.8); color: #000; }\n\n.pv-text-black { color: #000; }\n.pv-text-white { color: #FFFFFF; }\n.pv-text-gray  { color: #555; }\n.pv-text-red   { color: #e1002a; }\n.pv-text-green { color: #e9bc2f; }\n\n.pv-form-height  { height: 20px; padding: 0 5px;}\nselect.pv-form-height  { font-size: 12px; }\n.pv-round { border-radius: 10px; padding: 0 10px; }\n\n.hover-higlight:hover { background: #333; color: #eee; }\n\n/* ---- Layout related ---- */\n\n.float-right { float: right; }\n.float-left { float: left; }\n\n.padding { margin: 5px 2px; }\n.nopadding { padding-left: 0 !important; padding-right: 0 !important; }\n\n.pv-side-margin { margin: 0 5px; }\n.pv-side-padding { padding: 0 5px; }\n\n.lower-right-round-corner { border-radius: 0 0 10px 0; }\n\n/* ---- Scroll management ---- */\n\n.no-overflow { overflow: hidden; }\n.scroll-overflow { overflow: auto; }\n\n.pv-fixed { position: absolute; top: 0; left: 15px; right: 15px; z-index: 1; }\n.pv-fixed .pv-editor-bar { margin: 0 !important; padding: 0 !important; }\n\n/* ---- Bootstrap override ---- */\n\n.breadcrumb { margin-bottom: 0; }\n\n.dl-horizontal dd { margin-left: 80px; }\n.dl-horizontal dt { width: 60px; }\n\n/* ---- Save Data Panel ---- */\n.inspector-container .active-panel-btn  { border-radius: 15px; }\n.label-spacing     { margin-top: 15px; margin-bottom: 5px;}\n\n/* ---- Information Tab ---- */\n\n.pv-data-info dl { margin-bottom: 0; }\n.pv-data-info .table { margin-bottom: 20px; }\n\n.pv-callout {\n    -moz-border-bottom-colors: none;\n    -moz-border-left-colors: none;\n    -moz-border-right-colors: none;\n    -moz-border-top-colors: none;\n    border-color: #eee;\n    border-image: none;\n    border-radius: 10px;\n    border-style: solid;\n    border-width: 1px 1px 1px 5px;\n    margin: 20px 0;\n    padding: 20px;\n    background: white;\n}\n.pv-callout h4 { margin-bottom: 5px; margin-top: 0; }\n.pv-callout p:last-child { margin-bottom: 0; }\n.pv-callout + .pv-callout { margin-top: -5px; }\n.pv-callout-info { border-left-color: #222; }\n.pv-callout-info h4 { color: #222; }\n\n/* ---- Hide things until connection made ---- */\n.hide-on-start { display: none; }\n.start-page-image { display: block; margin-left: auto; margin-right: auto }\n.start-page-busy-icon { font-size: 48px; margin-left: auto; margin-right: auto; display: block; width: 68px; }\n\n.download-progressbar-container {\n    position: absolute;\n    top: 20px;\n    right: 20px;\n    width: 300px;\n    height: 80px;\n    z-index: 1000;\n    background-color: #222222;\n    border-radius: 3px;\n    box-shadow: 5px 5px 5px #333333;\n    text-align: center;\n}\n\n.progressbar-content-container {\n    position: absolute;\n    top: 25px;\n    right: 0px;\n    bottom: 0px;\n    left: 0px;\n    border-radius: 0px 0px 3px 3px;\n    background-color: #dddddd;\n    text-align: center;\n}\n\n.progressbar-title {\n    color: whitesmoke;\n    line-height: 25px;\n}\n\n.progress-message-span {\n    position: absolute;\n    left: 4px;\n    top: 6px;\n}\n\n.progress-meter-container {\n    position: absolute;\n    bottom: 3px;\n    left: 3px;\n    right: 3px;\n    top: 30px;\n}\n\n.local-only { display: none; }\n\ntable.viewport-stat                     { table-layout: fixed; overflow: hidden; }\ntable.viewport-stat > tbody > tr > td   { width: 60px; text-align: right; }\n", ""]);

	// exports


/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUwMCAzOTgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwMCAzOTgiIHhtbDpzcGFjZT0icHJlc2VydmUiPgogICAgPHBvbHlnb24gZmlsbD0iI0ZGRkZGRiIgcG9pbnRzPSI2Ni41LDM4OS40IDEyLjIsMzg5LjQgNDEuNyw5IDE2OC41LDkgIi8+PHBvbHlnb24gZmlsbD0iI0ZGRkZGRiIgcG9pbnRzPSIzMTQuNSwzODkuNCAyNjAuMiwzODkuNCAzNjIuMiw5IDQ4OSw5ICIvPjxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iMjA3LjUsMTIzLjEgMTAwLjQsMzg5LjQgMjI3LjIsMzg5LjQgMjU4LjIsMTIzLjEgIi8+Cjwvc3ZnPg=="

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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"

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = pv;

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = "<div class=\"container-fluid pv-visualizer-app\">\n    <div class=\"row-fluid app-wait-start-page\">\n        <div class=\"span12 start-page-image pvw-startup-logo\"></div>\n        <div class=\"vtk-icon-cog animate-spin start-page-busy-icon\"></div>\n    </div>\n    <div class='row pv-gray-darker head-toolbar hide-on-start'>\n        <div class='col-xs-12 col-sm-5 col-md-4 col-lg-3 bar-height'>\n            <i class='clickable toggle-inspector pvw-logo-button'\n                 data-toggle='tooltip'\n                 data-placement='bottom'\n                 title='Toggle Inspector Panel'></i>\n            <span\n                class='vtk-icon-flow-cascade clickable padding inspector-selector' data-type='pipeline' data-toggle='tooltip' data-placement='bottom' title='Show Pipeline'>\n            </span>\n            <span\n                class='vtk-icon-doc-text clickable padding inspector-selector' data-type='files' data-toggle='tooltip' data-placement='bottom' title='Show File List'>\n            </span>\n            <span\n                class='vtk-icon-plus clickable padding inspector-selector' data-type='sources' data-toggle='tooltip' data-placement='bottom' title='Show Sources/Filters'>\n            </span>\n            <span\n                class='vtk-icon-info-1 clickable padding inspector-selector need-input-source' data-type='info' data-toggle='tooltip' data-placement='bottom' title='Show Data Info'>\n            </span>\n            <span\n                class='vtk-icon-resize-full-alt-1 reset-camera clickable' data-toggle='tooltip' data-placement='bottom' title='Reset Camera'>\n            </span>\n            <span\n                class='vtk-icon-floppy clickable padding inspector-selector' data-type='saveopts' data-toggle='tooltip' data-placement='bottom' title='Show Save Options'>\n            </span>\n            <span\n                class='vtk-icon-clock-1 toggle-time-toolbar clickable' data-toggle='tooltip' data-placement='bottom' title='Toggle VCR Controls'>\n            </span>\n            <span\n                class='vtk-icon-cog-alt clickable padding inspector-selector float-right not-busy' data-type='preferences' style=\"margin: 0\" data-toggle='tooltip' data-placement='bottom' title='Show Preferences'>\n            </span>\n            <span class='vtk-icon-spin4 busy animate-spin clickable float-right'>\n            </span>\n        </div>\n        <div class='col-xs-12 col-sm-5 col-md-4 col-lg-9 vcr-control bar-height'>\n            <span class='vtk-icon-to-start vcr-action clickable' data-action='first' data-toggle='tooltip' data-placement='bottom' title='To First'></span>\n            <span class='vtk-icon-fast-bw vcr-action clickable' data-action='prev' data-toggle='tooltip' data-placement='bottom' title='To Previous'></span>\n            <span class='vtk-icon-play vcr-play clickable' data-toggle='tooltip' data-placement='bottom' title='Play'></span>\n            <span class='vtk-icon-stop vcr-stop clickable' data-toggle='tooltip' data-placement='bottom' title='Stop'></span>\n            <span class='vtk-icon-fast-fw vcr-action clickable' data-action='next' data-toggle='tooltip' data-placement='bottom' title='To Next'></span>\n            <span class='vtk-icon-to-end vcr-action clickable' data-action='last' data-toggle='tooltip' data-placement='bottom' title='To Last'></span>\n            <input type='text' class='pv-time-input time-value pv-gray-darker' value='0.0'/>\n            <span class='vtk-icon-download vcr-fetch-times clickable local-only' data-action='allsteps' data-toggle='tooltip' data-placement='bottom' title='Fetch All Timesteps'></span>\n            <span class='vtk-icon-trash vcr-clear-cache clickable local-only' data-action='clearcache' data-toggle='tooltip' data-placement='bottom' title='Clear Cache'></span>\n        </div>\n    </div>\n\n    <div class=\"row hide-on-start\" style=\"position: relative;\">\n        <div class='col-xs-12 col-sm-5 col-md-4 col-lg-3 scroll-overflow fix-height pv-gray-lighter-transparent lower-right-round-corner inspector-container' style='z-index: 1000; overflow-y: auto; overflow-x: hidden;'>\n            <div class=\"row inspector\" data-type=\"pipeline\">\n                <div class='clickable col-xS-12 col-sm-12 col-md-12 col-lg-12 nopadding pv-pipeline'>\n                </div>\n                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 pv-proxy-editor'>\n                </div>\n            </div>\n            <div class=\"row inspector\" data-type=\"files\">\n                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 pv-files'>\n                </div>\n            </div>\n            <div class=\"row inspector\" data-type=\"sources\">\n                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 pv-source-list nopadding'>\n                </div>\n                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 pv-filter-list nopadding need-input-source'>\n                </div>\n            </div>\n            <div class=\"row inspector\" data-type=\"info\">\n                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 pv-data-info'>\n                </div>\n            </div>\n            <div class=\"row inspector\" data-type=\"preferences\">\n                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 pv-preferences'>\n                    <div class=\"row\" style='margin-top: 15px;'>\n                        <label class='col-sm-5 control-label'\n                               data-toggle='tooltip'\n                               data-placement='right'\n                               title='Select rendering mode'>Rendering</label>\n                        <div class='col-sm-5'>\n                            <select class='pv-update-viewport' data-property-name='ActiveRendererType'>\n                                <option value='image'>Remote</option>\n                                <option value='vgl'>Local (VGL)</option>\n                                <option value='webgl'>Local (deprecated)</option>\n                            </select>\n                        </div>\n                    </div>\n                    <div class=\"row\">\n                        <label class='col-sm-5 control-label'\n                               data-toggle='tooltip'\n                               data-placement='right'\n                               title='Toggle local rendering statistics'>Statistics</label>\n                        <div class='col-sm-5'>\n                            <input type='checkbox' class='pv-update-viewport checkbox' data-property-name='Stats'/>\n                        </div>\n                    </div>\n                    <div class=\"row\">\n                        <label class='col-sm-5 control-label'\n                               data-toggle='tooltip'\n                               data-placement='right'\n                               title='Shutdown server process when leaving page'>Auto&nbsp;shutdown</label>\n                        <div class='col-sm-5'>\n                            <input type='checkbox' class='pv-update-viewport checkbox' data-property-name='CloseBehavior' checked/>\n                        </div>\n                    </div>\n                    <div class=\"row\" style=\"height: 15px;\"><br/></div>\n                </div>\n                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 pv-global-settings-editor'>\n                </div>\n            </div>\n            <div class=\"row inspector\" data-type=\"saveopts\" style=\"display: none;\">\n                <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12 pv-savedata-options'>\n                    <div class=\"row\">\n                        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 btn-group btn-group-sm\" role=\"group\" aria-label=\"Save Types\" style=\"margin-top: 15px;\">\n                            <button type=\"button\" data-action=\"screen\" class=\"btn btn-default active-panel-btn col-xs-4 col-sm-4 col-md-4 col-lg-4\">Screenshot</button>\n                            <button type=\"button\" data-action=\"data\" class=\"btn btn-default active-panel-btn col-xs-4 col-sm-4 col-md-4 col-lg-4\">Data</button>\n                            <button type=\"button\" data-action=\"state\" class=\"btn btn-default active-panel-btn col-xs-4 col-sm-4 col-md-4 col-lg-4\">State</button>\n                        </div>\n                    </div>\n                    <div class=\"row screenshot-save-only label-spacing\">\n                        <div class=\"col-xs-12\">\n                            Desired Resolution\n                            <span class=\"vtk-icon-arrows-cw screenshot-reset-size-btn clickable float-right\" data-toggle='tooltip' data-placement='bottom' title='Current Screen Size'></span>\n                        </div>\n                    </div>\n                    <div class=\"row screenshot-save-only\">\n                        <div class=\"col-xs-12 text-center\">\n                            <input type=\"text\" style=\"width: 45%\" class=\"screenshot-pixel-width light-form-control input-sm float-left\">\n                            x\n                            <input type=\"text\" style=\"width: 45%\" class=\"screenshot-pixel-height light-form-control input-sm float-right\">\n                        </div>\n                    </div>\n                    <div class=\"row label-spacing\">\n                        <div class=\"col-xs-4\">\n                            Filename\n                        </div>\n                        <div class=\"col-xs-8 text-right\">\n                            <span class=\"data-save-only active-data-type-label\"></span>\n                        </div>\n                    </div>\n                    <div class=\"row\">\n                        <div class=\"col-xs-12\">\n                            <input type=\"text\" class=\"save-data-filename form-control input-sm\" data-toggle='tooltip' data-placement='bottom' title='Enter relative path and filename to server location where file should be written'/>\n                        </div>\n                    </div>\n                    <div class=\"row label-spacing\">\n                        <div class=\"col-xs-6\">\n                            <button type=\"button\"\n                                    class=\"screenshot-save-only screenshot-grab-image-btn btn btn-default btn-sm\"\n                                    data-toggle=\"tooltip\"\n                                    data-placement=\"bottom\"\n                                    title=\"Capture contents of render window\">Capture</button>\n                        </div>\n                        <div class=\"col-xs-6 text-right\">\n                            <button type=\"button\"\n                                    class=\"save-data-button btn btn-default btn-sm\"\n                                    data-toggle=\"tooltip\"\n                                    data-placement=\"bottom\"\n                                    title=\"Save file to server\">Save</button>\n                        </div>\n                    </div>\n                    <div class=\"row label-spacing captured-screenshot-container screenshot-save-only\">\n                        <div class=\"col-xs-12\">\n                            <img class=\"captured-screenshot-image hidden\" width=\"100%\" style=\"border: 1px solid black;\" data-toggle='tooltip' data-placement='top' title='To save full size image locally, right-click image and choose \"Save Image As...\"'></img>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class='no-overflow pv-viewport fix-height' style='width: 100%; position: absolute;'>\n        </div>\n    </div>\n</div>\n"

/***/ }
/******/ ]);