adminModule
	.controller('editCategoryDialogController', ['$scope', '$mdDialog', 'Category', 'Preloader', 'User', 'CategoryGroup', function($scope, $mdDialog, Category, Preloader, User, CategoryGroup){
		var categoryID = Preloader.get();

		User.index()
			.then(function(data){
				$scope.groups = data.data.groups;

				return data.data;
			})
			.then(function(groups){
				// console.log(groups);
				Category.show(categoryID)
					.success(function(data){
						$scope.private = data.groups.length ? true : false;
						$scope.category = data;
						$scope.category.groups = [];

						angular.forEach($scope.groups, function(item, key){
							$scope.category.groups.push(null);
							CategoryGroup.relation(categoryID, item.id)
								.success(function(related){
									if(related){
										$scope.category.groups.splice(key, 1, item);
									}
								})
						});
					});
			})

		
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
				if($scope.private){
					$scope.count = 0;

					angular.forEach($scope.category.groups, function(item){
						if(item){
							$scope.count++;
						}
					});

					if(!$scope.count){
						$scope.show = true;
					}
				}

				if(!busy){;
					if(($scope.private && $scope.count) || (!$scope.private)){
						busy = true;
						Category.update(categoryID, $scope.category)
							.success(function(data){
								if(data){
									if($scope.private){
										angular.forEach($scope.category.groups, function(item){
											if(item){
												item.category_id = data;
												item.include = true;
											}
										});
									}

									CategoryGroup.update(categoryID, $scope.category.groups)
										.success(function(){
											// Stops Preloader 
											Preloader.stop();
											busy = false;		
										})
								}
								else{
									// Stops Preloader 
									busy = false;
									Preloader.stop();
								}
							})
							.error(function(){
								Preloader.error()
							});
					}
				}
			}
		}
	}]);