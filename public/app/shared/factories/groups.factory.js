sharedModule
	.factory('Group', ['$http', function($http){
		var urlBase = '/group';
		
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
			checkDuplicate: function(data){
				return $http.post(urlBase + '-check-duplicate', data);
			}
		};
	}])