var guestModule = angular.module('guest', [
	'sharedModule',
]);
guestModule
	.config(['$stateProvider',function($stateProvider) {
		$stateProvider
			.state('main', {
				url:'/',
				views: {
					'': {
						templateUrl: '/app/shared/views/main.view.html',
						controller: 'mainViewController',
					},
					'content-container@main': {
						templateUrl: '/app/shared/views/content-container.view.html',
						controller: 'mainContentContainerController',
					},
					'content@main': {
						templateUrl: '/app/components/guest/templates/content/main-content.template.html',
					},
					'toolbar@main': {
						templateUrl:'/app/shared/templates/toolbar.template.html',
					},
				},
			})
			.state('main.category', {
				url:'category/{categoryID}',
				params: {'categoryID':null},
				views: {
					'content-container': {
						templateUrl: '/app/shared/views/content-container.view.html',
						controller: 'categoryContentContainerController',
					},
					'content@main.category': {
						templateUrl: '/app/shared/templates/category-content.template.html',
					},
					'toolbar@main.category': {
						templateUrl:'/app/shared/templates/toolbar.template.html',
					},
				},
			})
	}]);
guestModule
	.controller('categoryContentContainerController', ['$scope', '$state', '$stateParams', '$mdDialog', 'Category', 'Document', 'Preloader', 'User', function($scope, $state, $stateParams, $mdDialog, Category, Document, Preloader, User){
		var categoryID = $stateParams.categoryID;
		/**
		 * Object for toolbar
		 *
		*/
		$scope.toolbar = {};
		$scope.toolbar.showBack = true;

		$scope.searchUserInput = function(){
			$scope.document.show = false;
			Preloader.loading();
			Document.search($scope.toolbar)
				.success(function(data){
					$scope.document.results = data;
					Preloader.stop();
				})
				.error(function(){
					Preloader.error();
				});
		};

		Category.show(categoryID)
			.success(function(data){
				if(data.groups.length){
					$state.go('page-not-found');
				}
				
				$scope.category = data;
				$scope.toolbar.childState = data.name;
			})
			.error(function(){
				Preloader.error();
			});

		$scope.document = {};
		$scope.document.paginated = [];
		// 2 is default so the next page to be loaded will be page 2 
		$scope.document.page = 2;

		Document.paginateCategory(categoryID)
			.success(function(data){
				$scope.document.details = data;
				$scope.document.paginated = data.data;
				$scope.document.show = true;

				$scope.document.paginateLoad = function(){
					// kills the function if ajax is busy or pagination reaches last page
					if($scope.document.busy || ($scope.document.page > $scope.document.details.last_page)){
						return;
					}
					/**
					 * Executes pagination call
					 *
					*/
					// sets to true to disable pagination call if still busy.
					$scope.document.busy = true;

					Document.paginateCategory(categoryID, $scope.document.page)
						.success(function(data){
							// increment to call the next page for the next call
							$scope.document.page++;
							// iterate over the paginated data and push it to the original array
							angular.forEach(data.data, function(item){
								$scope.document.paginated.push(item);
							});
							// Enables again the pagination call for next call.
							$scope.report.busy = false;
						})
						.error(function(){
							Preloader.error();
						});
				}
			})
			.error(function(){
				Preloader.error();
			});	

		$scope.refresh = function(){
        	Preloader.loading();
			$scope.toolbar.userInput = '';
			
			$scope.document = {};
			$scope.document.show = false;
			$scope.document.paginated = [];
			// 2 is default so the next page to be loaded will be page 2 
			$scope.document.page = 2;

			Document.paginateCategory(categoryID)
				.success(function(data){
					$scope.document.details = data;
					$scope.document.paginated = data.data;
					$scope.document.show = true;
					/* stops both preloader*/
					Preloader.stop();
					Preloader.stop();
				})
				.error(function(){
					Preloader.error();
				});
		};

		// $scope.fab = {};

		// $scope.fab.show = true;
		// $scope.fab.icon = 'mdi-plus';
		// $scope.fab.label = 'File';
		// $scope.fab.action = function(){
		// 	$mdDialog.show({
		//     	controller: 'addDocumentDialogController',
		//       	templateUrl: '/app/components/admin/templates/dialogs/add-document-dialog.template.html',
		//       	parent: angular.element(document.body),
		//     })
	 //        .then(function() {
	 //          	$scope.refresh();
	 //        });
		// };	

		$scope.openFile = function(id){
			var win = window.open('/document-view/' + id + '/category/' + categoryID);
			win.focus();
		}

		// $scope.edit = function(id){
		// 	Preloader.set(id);
		// 	$mdDialog.show({
		//     	controller: 'editDocumentDialogController',
		//       	templateUrl: '/app/components/admin/templates/dialogs/edit-document-dialog.template.html',
		//       	parent: angular.element(document.body),
		//     })
	 //        .then(function() {
	 //          	$scope.refresh();
	 //        });
		// }

		// $scope.delete = function(id){
		// 	var confirm = $mdDialog.confirm()
		//         .title('Delete File')
		//         .textContent('Are you sure you want to delete this file ?')
		//         .ariaLabel('Delete File')
		//         .ok('Delete')
		//         .cancel('Cancel');
		//     $mdDialog.show(confirm).then(function() {
		//     	Preloader.loading();
		//     	Document.delete(id)
		//     		.success(function(){
		//     			Preloader.stop();
		//     			$scope.refresh();
		//     		})
		//     		.error(function(){
		//     			Preloader.error();
		//     		});
		//     }, function() {
		//     	return;
		//     });
		// }
	}]);
guestModule
	.controller('mainContentContainerController', ['$scope', '$state', '$mdDialog', 'Category', 'Document', 'Preloader', function($scope, $state, $mdDialog, Category, Document, Preloader){
		$scope.show = {};
		// Init the content of the page
		Category.index()
			.success(function(data){
				$scope.categories = data;
				angular.forEach(data, function(item){
					item.charLimit = 25;
				});
				$scope.show.categories = true;
			})
			.error(function(){
				Preloader.error();
			});

		$scope.refresh = function(){
			$scope.toolbar.userInput = '';
			$scope.results = [];
			$scope.show.categories = false;
			$scope.categories = [];
        	Preloader.loading();
			Category.index()
				.success(function(data){
					$scope.categories = data;
					$scope.show.categories = true;
					angular.forEach(data, function(item){
						item.charLimit = 35;
					});
					/* stops both preloader*/
					Preloader.stop();
					Preloader.stop();
				})
				.error(function(){
					Preloader.error();
				});
		}

		$scope.viewDescription = function(data){
			$mdDialog.show(
			    $mdDialog.alert()
			    	.parent(angular.element(document.body))
			        .clickOutsideToClose(true)
			        .title('Description')
			        .textContent(data)
			        .ariaLabel('Description')
			        .ok('Okay')
			);
		}
		
		/**
		 * Object for toolbar
		 *
		*/
		$scope.toolbar = {};
		$scope.toolbar.childState = 'Home';

		$scope.searchUserInput = function(){
			$scope.show.categories = false;
			Preloader.loading();
			Document.search($scope.toolbar)
				.success(function(data){
					$scope.results = data;
					angular.forEach(data, function(item){
						item.charLimit = 35;
					});
					Preloader.stop();
				})
				.error(function(){
					Preloader.error();
				});
		};

		// $scope.fab = {};

		// $scope.fab.show = true;
		// $scope.fab.icon = 'mdi-plus';
		// $scope.fab.label = 'Category';
		// $scope.fab.action = function(){
		// 	$mdDialog.show({
		//     	controller: 'addCategoryDialogController',
		//       	templateUrl: '/app/components/admin/templates/dialogs/add-category-dialog.template.html',
		//       	parent: angular.element(document.body),
		//     })
	 //        .then(function() {
	 //          	$scope.refresh();
	 //        });
		// };	

		$scope.viewCategory = function(id){
			$state.go('main.category', {'categoryID': id});
		};

		$scope.openFile = function(id, categoryID){
			var win = window.open('/document-view/' + id + '/category/' + categoryID);
			win.focus();
		}

		// $scope.editFolder = function(id){
		// 	Preloader.set(id);
		// 	$mdDialog.show({
		//     	controller: 'editCategoryDialogController',
		//       	templateUrl: '/app/components/admin/templates/dialogs/add-category-dialog.template.html',
		//       	parent: angular.element(document.body),
		//     })
	 //        .then(function() {
	 //          	$scope.refresh();
	 //        });
		// }

		// $scope.edit = function(id){
		// 	Preloader.set(id);
		// 	$mdDialog.show({
		//     	controller: 'editDocumentDialogController',
		//       	templateUrl: '/app/components/admin/templates/dialogs/edit-document-dialog.template.html',
		//       	parent: angular.element(document.body),
		//     })
	 //        .then(function() {
	 //          	$scope.refresh();
	 //        });
		// }

		// $scope.delete = function(id){
		// 	var confirm = $mdDialog.confirm()
		//         .title('Delete File')
		//         .textContent('Are you sure you want to delete this file ?')
		//         .ariaLabel('Delete File')
		//         .ok('Delete')
		//         .cancel('Cancel');
		//     $mdDialog.show(confirm).then(function() {
		//     	Preloader.loading();
		//     	Document.delete(id)
		//     		.success(function(){
		//     			Preloader.stop();
		//     			$scope.refresh();
		//     		})
		//     		.error(function(){
		//     			Preloader.error();
		//     		});
		//     }, function() {
		//     	return;
		//     });
		// }
	}]);
//# sourceMappingURL=guest.js.map
