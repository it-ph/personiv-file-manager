adminModule
	.controller('editGroupDialogController', ['$scope', '$mdDialog', 'Group', 'Preloader', function($scope, $mdDialog, Group, Preloader){
		var groupID = Preloader.get();
		var busy = false;

		$scope.checkDuplicate = function(){
			$scope.duplicate = false;
			Group.checkDuplicate($scope.group)
				.success(function(data){
					$scope.duplicate = data;
				});
		}

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		Group.show(groupID)
			.success(function(data){
				$scope.group = data;
			})

		$scope.submit = function(){
			if($scope.createGroupForm.$invalid){
				angular.forEach($scope.createGroupForm.$error, function(field){
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
				if(!busy && !$scope.duplicate){
					busy = true;
					Group.update(groupID, $scope.group)
						.success(function(data){
							busy = false;
							if(!data){
								// Stops Preloader 
								Preloader.stop();
							}
						})
						.error(function(){
							Preloader.error()
						});
				}
			}
		}
	}]);