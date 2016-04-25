adminModule
	.controller('editCategoryDialogController', ['$scope', '$mdDialog', 'Category', 'Preloader', function($scope, $mdDialog, Category, Preloader){
		var categoryID = Preloader.get();

		Category.show(categoryID)
			.success(function(data){
				$scope.category = data;
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
				Preloader.loading();
				/**
				 * Stores Single Record
				*/
				if(!busy){
					busy = true;
					Category.update(categoryID, $scope.category)
						.success(function(){
							// Stops Preloader 
							Preloader.stop();
							busy = false;
						})
						.error(function(){
							Preloader.error()
						});
				}
			}
		}
	}]);