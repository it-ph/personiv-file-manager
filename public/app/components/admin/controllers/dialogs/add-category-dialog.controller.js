adminModule
	.controller('addCategoryDialogController', ['$scope', '$mdDialog', 'Category', 'Preloader', 'User', 'CategoryGroup', function($scope, $mdDialog, Category, Preloader, User, CategoryGroup){
		$scope.category = {};
		$scope.category.groups = [];
		User.index()
			.success(function(data){
				$scope.groups = data.groups;
			});

		var busy = false;

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		$scope.submit = function(){
			if($scope.addCategoryForm.$invalid){
				angular.forEach($scope.addCategoryForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else{
				/* Starts Preloader */
				// Preloader.loading();
				/**
				 * Stores Single Record
				*/
				if(!busy){
					if(($scope.private && $scope.category.groups.length) || (!$scope.private && !$scope.category.groups.length)){
						busy = true;
						Category.store($scope.category)
							.success(function(data){
								if(data){
									angular.forEach($scope.category.groups, function(item){
										item.category_id = data;
									});

									CategoryGroup.store($scope.category.groups)
										.success(function(){
											// Stops Preloader 
											Preloader.stop();
											busy = false;		
										})
								}
								else{
									// Stops Preloader 
									Preloader.stop();
									busy = false;
								}
							})
							.error(function(){
								Preloader.error()
							});
					}
					else{
						$scope.show = true;
					}
				}
			}
		}
	}]);