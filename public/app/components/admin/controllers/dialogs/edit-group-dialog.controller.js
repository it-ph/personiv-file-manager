adminModule
	.controller('editGroupDialogController', ['$scope', '$mdDialog', 'Group', 'Preloader', 'User', 'GroupUser', function($scope, $mdDialog, Group, Preloader, User, GroupUser){
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
				$scope.group.users = [];
				var count = 0;
				
				User.all()
					.success(function(data){
						$scope.users = data;

						angular.forEach(data, function(user, idx){
							$scope.group.users.push(null);
							GroupUser.relation($scope.group.id, user.id)
								.success(function(related){
									if(related){
										$scope.group.users.splice(idx, 1, user);
									}
								})
						});
					});


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
				$scope.count = 0;
				angular.forEach($scope.group.users, function(item){
					if(item){
						$scope.count++;
					}
				});

				if(!$scope.count){
					$scope.show = true;
				}

				if(!busy && !$scope.duplicate && $scope.count){
					busy = true;
					Group.update(groupID, $scope.group)
						.success(function(data){
							busy = false;
							if(!typeof(data) === 'string'){
								$scope.duplicate = data;
							}
							else if(typeof(data) === 'string'){
								angular.forEach($scope.group.users, function(item){
									if(item){
										item.group_id = data;
									}
								});

								GroupUser.update(groupID, $scope.group.users)
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