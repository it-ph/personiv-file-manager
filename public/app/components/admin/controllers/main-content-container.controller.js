adminModule
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

		$scope.openFile = function(id){
			var win = window.open('/document-view/' + id);
			win.focus();
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
	}]);