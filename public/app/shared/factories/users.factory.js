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