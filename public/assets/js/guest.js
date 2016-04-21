var guestModule = angular.module('guest', [
	'sharedModule',
]);
guestModule
	.config(['$stateProvider',function($stateProvider) {
		$stateProvider
			.state('main', {
				url:'/',
				views: {
					'': {
						templateUrl: '/app/shared/views/main.view.html',
						controller: 'mainViewController',
					},
					'content-container@main': {
						templateUrl: '/app/shared/views/content-container.view.html',
						controller: 'mainContentContainerController',
					},
					'content@main': {
						templateUrl: '/app/shared/templates/main-content.template.html',
					},
					'toolbar@main': {
						templateUrl:'/app/shared/templates/toolbar.template.html',
					},
				},
			})
	}]);
guestModule
	.controller('mainContentContainerController', ['$scope', '$state', '$mdDialog', 'Category', 'Preloader', function($scope, $state, $mdDialog, Category, Preloader){
		$scope.show = {};
		// Init the content of the page
		Category.index()
			.success(function(data){
				$scope.categories = data;
				$scope.show.categories = true;
			})
			.error(function(){
				Preloader.error();
			});

		$scope.refresh = function(){
			$scope.toolbar.userInput = '';
			$scope.show.categories = false;
			$scope.categories = [];
        	Preloader.loading();
			Category.index()
				.success(function(data){
					$scope.categories = data;
					$scope.show.categories = true;
					/* stops both preloader*/
					Preloader.stop();
					Preloader.stop();
				})
				.error(function(){
					Preloader.error();
				});
		}
		
		/**
		 * Object for toolbar
		 *
		*/
		$scope.toolbar = {};
		$scope.toolbar.childState = 'Home';

		$scope.searchUserInput = function(){
			$scope.show.categories.show = false;
			Preloader.loading();
			Category.search($scope.toolbar)
				.success(function(data){
					$scope.results = data;
					Preloader.stop();
				})
				.error(function(){
					Preloader.error();
				});
		};

		// $scope.fab = {};

		// $scope.fab.show = false;
		// $scope.fab.icon = 'mdi-plus';
	}]);
//# sourceMappingURL=guest.js.map
