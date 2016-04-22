adminModule
	.controller('categoryContentContainerController', ['$scope', '$state', '$stateParams', '$mdDialog', 'Category', 'Document', 'Preloader', function($scope, $state, $stateParams, $mdDialog, Category, Document, Preloader){
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

		$scope.fab = {};

		$scope.fab.show = true;
		$scope.fab.icon = 'mdi-plus';
		$scope.fab.label = 'File';
		$scope.fab.action = function(){
			$mdDialog.show({
		    	controller: 'addDocumentDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/add-document-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		};	

		$scope.openFile = function(id){
			var win = window.open('/document-view/' + id);
			win.focus();
		}
	}]);