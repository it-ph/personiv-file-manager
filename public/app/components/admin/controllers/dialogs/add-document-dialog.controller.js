adminModule
	.controller('addDocumentDialogController', ['$scope', '$stateParams', '$mdDialog', 'FileUploader', 'Document', 'Preloader', function($scope, $stateParams, $mdDialog, FileUploader, Document, Preloader){
		$scope.document = {};
		$scope.document.category_id = $stateParams.categoryID;
		$scope.document.tags = [];

		var busy = false;

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		var uploader = {};

		uploader.filter = {
            name: 'imageFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|pdf|'.indexOf(type) !== -1;
            }
        };

        uploader.error = function(item /*{File|FileLikeObject}*/, filter, options) {
            $scope.fileError = true;
            $scope.pdfUploader.queue = [];
        };

        uploader.headers = { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')};

		/* Question Uploader */
		$scope.pdfUploader = new FileUploader({
			url: '/document-upload',
			headers: uploader.headers,
			queueLimit : 1
		})
		// FILTERS
        $scope.pdfUploader.filters.push(uploader.filter);
        
		$scope.pdfUploader.onWhenAddingFileFailed = uploader.error;
		$scope.pdfUploader.onAfterAddingFile  = function(){
			$scope.fileError = false;
		};
        
		$scope.submit = function(){
			$scope.showErrors = true;
			if($scope.addDocumentForm.$invalid){
				angular.forEach($scope.addDocumentForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else{
				if(!busy && $scope.pdfUploader.queue.length){
					busy = true;
					/* Starts Preloader */
					Preloader.saving();
					/**
					 * Stores Single Record
					*/
					Document.store($scope.document)
						.success(function(){
							$scope.pdfUploader.uploadAll();
							// Stops Preloader 
							Preloader.stop();
							busy = false;
						})
						.error(function(){
							Preloader.error()
						});
				}
			}
		};
	}]);