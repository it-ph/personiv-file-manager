sharedModule
	.factory('User', ['$http', function($http){
		var urlBase = '/user';
		
		return {
			index: function(){
				return $http.get(urlBase);
			},
			store: function(data){
				return $http.post(urlBase, data);
			},
			checkPassword: function(data){
				return $http.post(urlBase + '-check-password', data);
			},
			changePassword: function(data){
				return $http.post(urlBase + '-change-password', data);
			},
			others: function(){
				return $http.get(urlBase + '-others');
			},
			resetPassword: function(id){
				return $http.get(urlBase + '-reset-password/' + id);
			},
			delete: function(id){
				return $http.delete(urlBase + '/' + id);
			},
			checkEmail: function(data){
				return $http.post(urlBase + '-check-email', data);
			},
			all: function(){
				return $http.get(urlBase + '-all');
			},
		};
	}])