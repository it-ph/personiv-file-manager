adminModule
	.controller('mainContentContainerController', ['$scope', '$state', '$mdDialog', 'Category', 'Document', 'Preloader', 'User', function($scope, $state, $mdDialog, Category, Document, Preloader, User){
		$scope.show = {};
		
		$scope.refresh = function(){
			$scope.toolbar.userInput = '';
        	Preloader.loading();
			$scope.init(true);
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

		$scope.fab = {};

		$scope.fab.show = true;
		$scope.fab.icon = 'mdi-plus';
		$scope.fab.label = 'Category';
		$scope.fab.action = function(){
			$mdDialog.show({
		    	controller: 'addCategoryDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/add-category-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		};	

		$scope.viewCategory = function(id){
			$state.go('main.category', {'categoryID': id});
		};

		$scope.openFile = function(id, categoryID){
			var win = window.open('/document-view/' + id + '/category/' + categoryID);
			win.focus();
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

		$scope.editFolder = function(id){
			Preloader.set(id);
			$mdDialog.show({
		    	controller: 'editCategoryDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/add-category-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		}

		$scope.edit = function(id){
			Preloader.set(id);
			$mdDialog.show({
		    	controller: 'editDocumentDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/edit-document-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		}

		$scope.delete = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Delete File')
		        .textContent('Are you sure you want to delete this file ?')
		        .ariaLabel('Delete File')
		        .ok('Delete')
		        .cancel('Cancel');
		    $mdDialog.show(confirm).then(function() {
		    	Preloader.loading();
		    	Document.delete(id)
		    		.success(function(){
		    			Preloader.stop();
		    			$scope.refresh();
		    		})
		    		.error(function(){
		    			Preloader.error();
		    		});
		    }, function() {
		    	return;
		    });
		}

		// Init the content of the page
		$scope.init = function(refresh){
			User.index()
				.then(function(data){
					$scope.user = data.data;
					
					$scope.groups = [];

					angular.forEach($scope.user.groups, function(group){
						$scope.groups.push(group.id);
					});

					return $scope.groups;
				})
				.then(function(groups){
					Category.index()
						.success(function(data){
							$scope.public = data;
							$scope.show.categories = true;
						})

					Category.userGroups($scope.groups)
						.success(function(data){
							$scope.private = data;

							if(refresh){
								Preloader.stop();
								Preloader.stop();
							}

						})
						.error(function(){
							Preloader.error();
						});
				})
		}

		$scope.init();
	}]);