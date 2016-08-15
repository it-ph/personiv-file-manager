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
			search: function(data, id){
				return $http.post(urlBase + '-search/' + id, data);
			},
		};
	}])