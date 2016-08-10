adminModule
	.controller('settingsContentContainerController', ['$scope', '$state', '$mdDialog', 'Preloader', 'Group', 'User', function($scope, $state, $mdDialog, Preloader, Group, User){
		/**
		 * Object for toolbar
		 *
		*/
		$scope.toolbar = {};
		$scope.toolbar.childState = 'Settings';

		$scope.refresh = function(){
			Preloader.loading();
			$scope.init(true);
		}

		$scope.createGroup = function(){
			$mdDialog.show({
		    	controller: 'createGroupDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/group-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function(){
	        	$scope.refresh();
	        }, function() {
	        	return;
	        });
		}

		$scope.editGroup = function(id){
			Preloader.set(id);
			$mdDialog.show({
		    	controller: 'editGroupDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/group-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function(){
	        	$scope.refresh();
	        }, function() {
	        	return;
	        });
		}

		$scope.deleteGroup = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Delete Group')
		        .textContent('This group will be removed permanently.')
		        .ariaLabel('Delete Group')
		        .ok('Delete')
		        .cancel('Cancel');

		    $mdDialog.show(confirm)
		    	.then(function() {
			    	Group.delete(id)
			    		.success(function(){
			    			$scope.refresh();
			    			Preloader.deleted();
			    		})
			    		.error(function(){
			    			Preloader.error();
			    		});
			    }, function() {
			    	return;
			    });
		}	

		$scope.createUser = function(){
			$mdDialog.show({
		    	controller: 'createUserDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/create-user-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function(){
	        	$scope.refresh();
	        }, function() {
	        	return;
	        });
		}

		$scope.resetPassword = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Reset Password')
		        .textContent('Reset the password for this account?')
		        .ariaLabel('Reset Password')
		        .ok('Reset')
		        .cancel('Cancel');

		    $mdDialog.show(confirm)
		    	.then(function() {
			    	User.resetPassword(id)
			    		.success(function(){
			    			Preloader.toastChangesSaved();
			    		})
			    		.error(function(){
			    			Preloader.error();
			    		});
			    }, function() {
			    	return;
			    });
		}

		$scope.deleteAccount = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Delete Account')
		        .textContent('This account will be removed permanently.')
		        .ariaLabel('Delete Account')
		        .ok('Delete')
		        .cancel('Cancel');

		    $mdDialog.show(confirm)
		    	.then(function() {
			    	User.delete(id)
			    		.success(function(){
			    			$scope.refresh();
			    			Preloader.deleted();
			    		})
			    		.error(function(){
			    			Preloader.error();
			    		});
			    }, function() {
			    	return;
			    });
		}

		$scope.init = function(refresh){
			User.index()
				.success(function(data){
					if(!data){
						$state.go('main');
					}

					$scope.current_user = data;
				});

			Group.index()
				.then(function(data){
					$scope.groups = data.data;
				})
				.then(function(){
					User.others()
						.success(function(data){
							$scope.users = data;

							if(refresh){
								Preloader.stop();
								Preloader.stop();
							}
						})
						.error(function(){
							Preloader.error();
						});
				}, function(){
					Preloader.error();
				});
		}

		$scope.init();
	}]);