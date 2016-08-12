adminModule
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
						templateUrl: '/app/components/admin/templates/content/main-content.template.html',
					},
					'toolbar@main': {
						templateUrl:'/app/shared/templates/toolbar.template.html',
					}
				},
			})
			.state('main.category', {
				url:'category/{categoryID}',
				params: {'categoryID':null},
				views: {
					'content-container': {
						templateUrl: '/app/shared/views/content-container.view.html',
						controller: 'categoryContentContainerController',
					},
					'content@main.category': {
						templateUrl: '/app/shared/templates/category-content.template.html',
					},
					'toolbar@main.category': {
						templateUrl:'/app/shared/templates/toolbar.template.html',
					},
				},
			})
			.state('main.settings', {
				url:'settings',
				views: {
					'content-container': {
						templateUrl: '/app/shared/views/content-container.view.html',
						controller: 'settingsContentContainerController',
					},
					'content@main.settings': {
						templateUrl: '/app/components/admin/templates/content/settings-content.template.html',
					},
					'toolbar@main.settings': {
						templateUrl:'/app/shared/templates/toolbar.template.html',
					},
				},
			})
	}]);