adminModule
	.controller('createUserDialogController', ['$scope', '$mdDialog', 'User', 'Preloader', function($scope, $mdDialog, User, Preloader){
		$scope.user = {};
		$scope.user.role = 'admin';
		var busy = false;

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		$scope.checkEmail = function(){
			$scope.duplicate = false;
			User.checkEmail($scope.user)
				.success(function(data){
					$scope.duplicate = data;
				})
				.error(function(){
					Preloader.error();
				})
		}

		$scope.submit = function(){
			$scope.showErrors = true;
			if($scope.userForm.$invalid){
				angular.forEach($scope.userForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else if($scope.user.password != $scope.user.password_confirmation || $scope.duplicate)
			{
				return;
			}
			else {
				if(!busy && !$scope.duplicate)
				{
					// Preloader.saving();
					busy = true;

					User.store($scope.user)
						.success(function(data){
							if(!data){
								Preloader.stop();
								busy = false;
							}
						})
						.error(function(){
							Preloader.error();
							busy = false;
						});
				}
			}
		}
	}]);