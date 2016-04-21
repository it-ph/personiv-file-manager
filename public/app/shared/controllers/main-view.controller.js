sharedModule
	.controller('mainViewController', ['$scope', '$mdSidenav', '$mdToast', '$mdDialog', 'User', function($scope, $mdSidenav, $mdToast, $mdDialog, User){
		$scope.toggleSidenav = function(menuId) {
		    $mdSidenav(menuId).toggle();
		};

		User.index()
			.success(function(data){
				$scope.user = data;
			});

		$scope.changePassword = function()
		{
			$mdDialog.show({
		      controller: 'changePasswordDialogController',
		      templateUrl: '/app/components/admin/templates/dialogs/change-password-dialog.template.html',
		      parent: angular.element(document.body),
		    })
		    .then(function(){
		    	$mdToast.show(
		    		$mdToast.simple()
				        .content('Password changed.')
				        .position('bottom right')
				        .hideDelay(3000)
		    	);
		    });
		}

		var originatorEv;
	    $scope.openMenu = function($mdOpenMenu, ev) {
	    	originatorEv = ev;
	      	$mdOpenMenu(ev);
	    };
	}]);