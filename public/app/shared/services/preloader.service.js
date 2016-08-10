sharedModule
	.service('Preloader', ['$mdDialog', '$mdToast', function($mdDialog, $mdToast){
		var dataHolder = null;
		var user = null;

		return {
			/* Starts the preloader */
			loading: function(){
				return $mdDialog.show({
					templateUrl: '/app/shared/templates/loading.html',
				    parent: angular.element(document.body),
				});
			},
			saving: function(){
				return $mdDialog.show({
					templateUrl: '/app/shared/templates/saving.html',
				    parent: angular.element(document.body),
				});
			},
			/* Stops the preloader */
			stop: function(data){
				return $mdDialog.hide(data);
			},
			/* Shows error message if AJAX failed */
			error: function(){
				return $mdDialog.show(
			    	$mdDialog.alert()
				        .parent(angular.element($('body')))
				        .clickOutsideToClose(true)
				        .title('Oops! Something went wrong!')
				        .content('An error occured. Please contact administrator for assistance.')
				        .ariaLabel('Error Message')
				        .ok('Got it!')
				);
			},
			errorMessage: function(data){
				return $mdDialog.show({
				    controller: 'errorMessageController',
				    templateUrl: '/app/shared/templates/dialogs/error-message.template.html',
				    parent: angular.element(document.body),
				    clickOutsideToClose:true,
				});
			},
			/* Send temporary data for retrival */
			set: function(data){
				dataHolder = data;
			},
			/* Retrieves data */
			get: function(){
				return dataHolder;
			},
			/* Set User */
			setUser: function(data){
				user = data;
			},
			/* Get User */
			getUser: function(data){
				return user;
			},
			toastChangesSaved: function(){
				return $mdToast.show(
			    	$mdToast.simple()
				        .textContent('Changes saved.')
				        .position('bottom right')
				        .hideDelay(3000)
			    );
			},
			deleted: function(){
				return $mdToast.show(
			    	$mdToast.simple()
				        .textContent('Deleted')
				        .position('bottom right')
				        .hideDelay(3000)
			    );
			},
		};
	}]);