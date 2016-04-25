var sharedModule = angular.module('sharedModule', [
	/* Vendor Dependencies */
	'ui.router',
	'ngMaterial',
	'ngMessages',
	'infinite-scroll',
	'angular-tour',
	'ngCookies',
	'angularFileUpload'
]);
sharedModule
	.config(['$urlRouterProvider', '$stateProvider', '$mdThemingProvider', function($urlRouterProvider, $stateProvider, $mdThemingProvider){
		/* Defaul Theme Blue  */
		$mdThemingProvider.theme('default')
			.primaryPalette('blue')
		
		$urlRouterProvider
			.otherwise('/page-not-found')
			.when('', '/');

		$stateProvider
			.state('page-not-found',{
				url: '/page-not-found',
				templateUrl: '/app/shared/views/page-not-found.view.html',
			})
	}]);
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
sharedModule
	.factory('Category', ['$http', function($http){
		var urlBase = '/category';
		
		return {
			index: function(){
				return $http.get(urlBase);
			},
			show: function(id){
				return $http.get(urlBase + '/' + id);
			},
			store: function(data){
				return $http.post(urlBase, data);
			},
			update: function(id, data){
				return $http.put(urlBase + '/' + id, data);
			},
			delete: function(id){
				return $http.delete(urlBase + '/' + id);
			},
			search: function(data){
				return $http.post(urlBase + '-search', data);
			},
		};
	}])
sharedModule
	.factory('Document', ['$http', function($http){
		var urlBase = '/document';
		
		return {
			index: function(){
				return $http.get(urlBase);
			},
			show: function(id){
				return $http.get(urlBase + '/' + id);
			},
			store: function(data){
				return $http.post(urlBase, data);
			},
			update: function(id, data){
				return $http.put(urlBase + '/' + id, data);
			},
			delete: function(id){
				return $http.delete(urlBase + '/' + id);
			},
			paginateCategory: function(id, page){
				return $http.get(urlBase + '-paginate/' + id + '?page=' + page);
			},
			search: function(data){
				return $http.post(urlBase + '-search', data);
			},
		};
	}])
sharedModule
	.factory('Tag', ['$http', function($http){
		var urlBase = '/tag';
		
		return {
			index: function(){
				return $http.get(urlBase);
			},
			show: function(id){
				return $http.get(urlBase + '/' + id);
			},
			store: function(data){
				return $http.post(urlBase, data);
			},
			update: function(id, data){
				return $http.put(urlBase + '/' + id, data);
			},
			delete: function(id){
				return $http.delete(urlBase + '/' + id);
			},
			document: function(id){
				return $http.get(urlBase + '-document/' + id);
			},
		};
	}])
sharedModule
	.factory('User', ['$http', function($http){
		var urlBase = '/user';
		
		return {
			index: function(){
				return $http.get(urlBase);
			},
			checkPassword: function(data){
				return $http.post(urlBase + '-check-password', data)
			},
			changePassword: function(data){
				return $http.post(urlBase + '-change-password', data)
			},
		};
	}])
sharedModule
	.service('Preloader', ['$mdDialog', function($mdDialog){
		var dataHolder = null;
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
				$mdDialog.hide(data);
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
			/* Send temporary data for retrival */
			set: function(data){
				dataHolder = data;
			},
			/* Retrieves data */
			get: function(){
				return dataHolder;
			},
		};
	}]);
//# sourceMappingURL=shared.js.map
