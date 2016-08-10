adminModule
	.controller('createGroupDialogController', ['$scope', '$mdDialog', 'Group', 'GroupUser', 'Preloader', 'User', function($scope, $mdDialog, Group, GroupUser, Preloader, User){
		$scope.group = {};
		$scope.group.users = [];
		var busy = false;

		User.all()
			.success(function(data){
				$scope.users = data;
			});

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
				$scope.show = true;
				if(!busy && !$scope.duplicate && $scope.group.users.length){
					busy = true;
					Group.store($scope.group)
						.success(function(data){
							busy = false;
							if(!typeof(data) === 'string'){
								$scope.duplicate = data;
							}
							else if(typeof(data) === 'string'){
								angular.forEach($scope.group.users, function(item){
									item.group_id = data;
								});

								GroupUser.store($scope.group.users)
									.success(function(){
										Preloader.stop();
									})
									.error(function(){
										Preloader.error();
									})
							}
						})
						.error(function(){
							Preloader.error()
						});
				}
			}
		}
	}]);