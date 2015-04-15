var app = angular.module("xcomponents");

app.directive('xcList',
	['$rootScope', '$controller', '$filter', 'xcUtils', 'xcDataFactory',
	function($rootScope, $controller, $filter, xcUtils, xcDataFactory) {

	var loadData = function(scope) {

		//abort if the data needs to be filtered, but there's not filter value
		if (scope.filterBy && (typeof scope.filterValue == 'undefined' ||
			scope.filterValue == null || scope.filterValue.length==0) ) {
			return;
		}

		//console.info("LOAD FROM " + scope.url, scope.filterBy, scope.filterValue);

		if ( scope.srcDataEntries) {

			scope.isLoading = false;
			scope.hasMore = false;
			scope.items = scope.srcDataEntries;
			scope.totalNumItems = scope.srcDataEntries.length;

		} else {
			var url = scope.url;
			url = url.replace(':id', scope.selectedItemId);
			if(scope.type == 'accordion-remote'){
				if (!scope.embedded || (scope.embedded && scope.selectedItemId != null)){
					xcDataFactory.getStore(scope.datastoreType)
					.list(scope.categoryurl).then( function(res) {
						scope.groups = [];
						res = res.sort(function (a, b) {
				    	return a.toLowerCase().localeCompare(b.toLowerCase());
						});
						for (var g in res){
							scope.groups.push({"name": res[g], "entries": [], "collapsed": true});
						}

						scope.isLoading = false;
					});
				}
			}else{
				if (!scope.embedded || (scope.embedded && scope.selectedItemId != null)){
					xcDataFactory.getStore(scope.datastoreType)
					.all(url).then( function(res) {

						var numRes = res.data.length;

						if (scope.filterBy && scope.filterValue) {
							//filter the result set

							var filteredRes = [];

							angular.forEach( res.data, function(entry, idx) {

								if (entry[scope.filterBy] == scope.filterValue) {
									filteredRes.push( entry);
								}
							});

							res.data = filteredRes;

						}

						if (scope.type == 'categorised' || scope.type=='accordion') {

							scope.groups = xcUtils.getGroups( res.data, scope.groupBy, scope.orderBy, scope.orderReversed );
							scope.isLoading = false;

							//auto load first entry in the first group
							if (scope.autoloadFirst && !scope.selected && !bootcards.isXS() ) {

								if (scope.groups.length>0) {
									if (scope.groups[0].entries.length>0) { scope.select( scope.groups[0].entries[0] ); }
									if (scope.type == 'accordion') {		//auto expand first group
										scope.groups[0].collapsed = false;
									}
								}
							}

						} else {			//flat or detailed

							//sort the results
							res.data.sort( xcUtils.getSortByFunction( scope.orderBy, scope.orderReversed ) );

				      scope.items = res.data;
							scope.isLoading = false;
							scope.totalNumItems = res.count;
							scope.hasMore = scope.itemsShown < scope.totalNumItems;

							//auto load first entry in the list
							if (scope.autoloadFirst && !scope.selected && !bootcards.isXS() ) {
								scope.select( res.data[0] );
							}

						}

					});
				}
			}

		}
	};

	return {

		scope : {

			title : '@',			/*title of the list*/
			type : '@',				/*list type, options: flat (default), categorised, accordion*/
			modelName: '@',  /*required: name of the model to use for the form instance*/
			listWidth : '=' ,		/*width of the list (nr 1..11)*/
			summaryField : '@',		/*name of the field used as a summary field*/
			summaryFieldType : '@',
			detailsField : '@',
			detailsFieldType : '@',		/*text or date*/
			detailsFieldSubTop : '@',
			detailsFieldSubTopType : '@',
			detailsFieldSubBottom : '@',
			detailsFieldSubBottomType : '@',
			allowSearch : '=?',
			autoloadFirst : '=?',
			allowAdd : '=',
			groupBy : '@',			/*only relevant for categorised, accordion lists*/
			filterBy : '@',
			filterSrc : '@',
			filterValue : '@',
			orderBy : '@',
			orderReversed : '@',
			url : '@',
			srcData : '@',
			imageField : '@',		/*image*/
			iconField : '@',		/*icon*/
			imagePlaceholderIcon : '@',		/*icon to be used if no thumbnail could be found, see http://fortawesome.github.io/Font-Awesome/icons/ */
			datastoreType : '@',
			infiniteScroll : '@',
			embedded : '@',
			directEdit : '@',
			categoryurl: '@',
			documenturl: '@',
			responseurl: '@',
			categoryfield: '@',
			categoryFieldType: '@'
		},

		restrict : 'E',
		transclude : true,
		replace : true,

		templateUrl: function(elem,attrs) {
			//calculate the template to use
			return 'xc-list-' + attrs.type + '.html';
		},

		link : function(scope, elem, attrs) {
			if (!scope.model){
				return;
			}
			scope.colLeft = 'col-sm-' + attrs.listWidth;
			scope.colRight = 'col-sm-' + (12 - parseInt(attrs.listWidth, 10) );

			loadData(scope);

		},

		controller: function($rootScope, $scope, $modal, $filter, xcUtils, $cookieStore) {
			if (!$scope.modelName) {

				console.error("cannot load list: no model name provided");
				return;

			} else {

				//get the model config
				var models = xcUtils.getConfig('models');
				$scope.model = models[$scope.modelName];

				if (!$scope.model) {
					console.error("cannot load list: invalid model name provided ('" + $scope.modelName + "')");
					return;
				}
			}

			// instantiate base controller
			$controller('BaseController', {
				$scope: $scope,
				$modal : $modal
			} );

      $scope.fieldsRead = $scope.model.fieldsRead;
			$scope.fieldsEdit = $scope.model.fieldsEdit;
			$scope.imageBase = $scope.model.imageBase;
			$scope.fieldFilters = $scope.model.fieldFilters;

			$scope.hideList = false;
			$scope.orderReversed = $scope.$eval( $scope.orderReversed);		//for booleans
			$scope.datastoreType = (typeof $scope.datastoreType == 'undefined' ? 'accordion' : $scope.datastoreType);

			//set defaults
			$scope.embedded = (typeof $scope.embedded == 'undefined' ? false : $scope.embedded);
			$scope.directEdit = (typeof $scope.directEdit == 'undefined' ? false : $scope.directEdit);
			$scope.allowSearch = (typeof $scope.allowSearch == 'undefined' ? true : $scope.allowSearch);
			$scope.autoloadFirst = (typeof $scope.autoloadFirst == 'undefined' ? false : $scope.autoloadFirst);
			$scope.infiniteScroll = (typeof $scope.infiniteScroll == 'undefined' ? false : $scope.infiniteScroll);
			$scope.detailsFieldType = (typeof $scope.detailsFieldType == 'undefined' ? 'text' : $scope.detailsFieldType);
			$scope.summaryFieldType = (typeof $scope.summaryFieldType == 'undefined' ? 'text' : $scope.summaryFieldType);
			$scope.detailsFieldSubTopType = (typeof $scope.detailsFieldSubTopType == 'undefined' ? 'text' : $scope.detailsFieldSubTopType);
			$scope.detailsFieldSubBottomType = (typeof $scope.detailsFieldSubBottomType == 'undefined' ? 'text' : $scope.detailsFieldSubBottomType);
			$scope.categoryFieldType = (typeof $scope.categoryFieldType == 'undefined' ? 'text' : $scope.categoryFieldType);

			$scope.isLoading = true;
      $scope.hasMore = false;

			$scope.itemsPerPage = 20;
			$scope.itemsShown = $scope.itemsPerPage;

			$scope.selected = null;
			$scope.numPages = 1;

			$scope.host = xcUtils.getConfig('host');
			$scope.db = xcUtils.getConfig('db');
			$scope.apikey = $rootScope.apikey;
			if (xcomponents.readonly){
				$scope.allowAdd = false;
			}

			$rootScope.$on('refreshList', function(msg) {
				loadData($scope);
			});

			//custom list entries
			if ($scope.srcData) {
				$scope.srcDataEntries = xcUtils.getConfig( $scope.srcData);

				if ($scope.autoloadFirst) {
					$scope.selected = $scope.srcDataEntries[0];
					$rootScope.showCards = true;
				}

			}

			$scope.clearSearch = function() {
				$scope.filter = '';
			};

			$scope.colClass = function() {
				return ($scope.embedded ? '' : $scope.colLeft);
			};

			//bind events for infinite scroll
			if ($scope.infiniteScroll) {

				try {
					pullUpEl = document.getElementById('pullUp');
					pullUpOffset = pullUpEl.offsetHeight;
				} catch (e) {
				}

				if ($rootScope.iOS || $rootScope.Android ) {
					$('.bootcards-list').scroll(
						function() {
							if ($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight()) {
								$scope.flatViewScroll();
							}
						});
				} else {
					$(window).bind('scroll',
						function() {
							if ($(document).height() <= ($(window).height() + $(window).scrollTop() + 200)) {
								$scope.flatViewScroll();
							}
						});
				}

			}

			$scope.flatViewScroll = function() {
				$("#btnLoadMore").click();
			};

			$scope.toggleCategory = function(expand) {
				angular.forEach( $scope.groups, function(group) {
					if (group.name == expand.name) {
						group.collapsed = !expand.collapsed;
					} else {
						group.collapsed = true;
					}
				});
			};

			$scope.itemClick = function(item) {
				if ($scope.directEdit) {
					$scope.editDetails(item);
				} else {
					$scope.select(item);
				}
			};

			$scope.toggleCategoryRemote = function(expand) {
				angular.forEach( $scope.groups, function(group) {
					if (group.name == expand.name) {
						//Now go and get the data for this category (at least the first page anyway)
						var filter = {
					    "filters": [{
					      "operator": "contains",
					      "field": $scope.categoryfield,
					      "value": group.name
					    }]
					  };
						group.isLoading = true;
						xcDataFactory.getStore($scope.datastoreType)
						.allfilter($scope.url, filter).then( function(res) {

							group.collapsed = !expand.collapsed;
							group.entries = res.data;

							$scope.totalNumItems = res.count;
							group.totalNumItems = res.count;
							group.hasMore = group.entries.length < res.count;
							$scope.hasMore = group.hasMore;
							group.isLoading = false;
							$scope.isLoading = false;
						});
					} else {
						group.collapsed = true;
						group.entries = [];
					}
				});
			};

			$scope.groupLoadMore = function(group) {
				if (group.hasMore && !group.isLoading) {
					//Now go and get the data for this category (at least the first page anyway)
					var filter = {
						"filters": [{
							"operator": "contains",
							"field": $scope.categoryfield,
							"value": group.name
						}]
					};
					group.isLoading = true;
					xcDataFactory.getStore($scope.datastoreType)
					.allfilter($scope.url + "&start=" + group.entries.length, filter).then( function(res) {

						group.entries = group.entries.concat(res.data);

						$scope.totalNumItems = res.count;
						group.hasMore = group.entries.length < res.count;
						$scope.hasMore = group.hasMore;
						group.isLoading = false;
						$scope.isLoading = false;
					});
				}
			};

			$scope.select = function(item) {

				$scope.selected = item;
				$scope.$emit('selectItemEvent', item);

				//broadcast event to child scopes
				$scope.$broadcast('itemSelected', item);

			};


			$rootScope.$on('selectItemEvent', function(ev, item) {
				$scope.selectedItemId = item.__unid;
				if ($scope.filterBy) {
					$scope.filterValue = item[$scope.filterSrc];
				}
				if ($scope.embedded){
					loadData($scope);
				}
			});

			$scope.showImage = function(item) {
				return $scope.imageField && item[$scope.imageField];
			};
			$scope.showPlaceholder = function(item) {
				return $scope.imagePlaceholderIcon && !item[$scope.imageField];
			};
			$scope.showIcon = function(item) {
				return $scope.iconField && item[$scope.iconField];
			};

			$scope.delete = function(item) {
				loadData($scope);
			};

			$rootScope.$on('deleteItemEvent', function(ev, item) {
				$scope.delete(item);
			});

	    $scope.loadMore = function() {

				if ($scope.hasMore && !$scope.isLoading) {
					$scope.isLoading = true;
					xcDataFactory.getStore($scope.datastoreType)
					.all($scope.url + "&start=" + ($scope.itemsShown)).then( function(res) {

						var numRes = res.data.length;
						$scope.itemsShown += numRes;

						if ($scope.filterBy && $scope.filterValue) {
							//filter the result set

							var filteredRes = [];

							angular.forEach( res.data, function(entry, idx) {

								if (entry[$scope.filterBy] == $scope.filterValue) {
									filteredRes.push( entry);
								}
							});

							res.data = filteredRes;

						}

						if ($scope.type == 'categorised' || $scope.type=='accordion') {

							$scope.groups = xcUtils.getGroups( res.data, $scope.groupBy, $scope.orderBy, $scope.orderReversed );
							$scope.isLoading = false;

							//auto load first entry in the first group
							if ($scope.autoloadFirst && !$scope.selected && !bootcards.isXS() ) {

								if ($scope.groups.length>0) {
									if ($scope.groups[0].entries.length>0) { $scope.select( $scope.groups[0].entries[0] ); }
									if ($scope.type == 'accordion') {		//auto expand first group
										$scope.groups[0].collapsed = false;
									}
								}
							}

						} else {			//flat or detailed

							//sort the results
							res.data.sort( xcUtils.getSortByFunction( $scope.orderBy, $scope.orderReversed ) );

							$scope.items = $scope.items.concat(res.data);
							$scope.isLoading = false;
							$scope.totalNumItems = res.count;
							$scope.hasMore = $scope.itemsShown < $scope.totalNumItems;
						}
					});
				}
	    };

	    $scope.saveNewItem = function(targetItem) {
				if ($scope.selectedItemId != null && $scope.embedded){
					targetItem.__parentid = $scope.selectedItemId;
				}
	    	xcUtils.calculateFormFields(targetItem, $scope.model, function(){
					$scope.select(targetItem);

					xcDataFactory.getStore($scope.datastoreType)
					.saveNew( $scope.documenturl, targetItem )
					.then( function(res) {

						if ($scope.type == 'categorised' || $scope.type=='accordion' || $scope.type=='accordion-remote' || $scope.type == 'flat'){

							//do a full refresh of the list
							$rootScope.$emit('refreshList', '');
						} else if($scope.type == 'response'){
							//refresh the document
							$scope.$parent.$parent.select($scope.$parent.$parent.selected);
						} else {

							//add the item to the list and sort it
							var sortFunction = xcUtils.getSortByFunction( $scope.orderBy, $scope.orderReversed );

							$scope.items.push(res);

									//resort
									var ress = $scope.items;
									ress.sort( sortFunction );

									$scope.items = ress;

						}

					})
					.catch( function(err) {
						alert("The item could not be saved/ updated: " + err.statusText);
					});
				});

			};

		}

	};

}]);
