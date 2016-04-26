adminModule
	.controller('editDocumentDialogController', ['$scope', '$stateParams', '$mdDialog', 'FileUploader', 'Document', 'Tag', 'Preloader', function($scope, $stateParams, $mdDialog, FileUploader, Document, Tag, Preloader){
		var documentID = Preloader.get();
		$scope.document = {}
		// $scope.document.category_id = $stateParams.categoryID;
		$scope.document.tags = [];
		$scope.referenceTag = [];

		Document.show(documentID)
			.success(function(data){
				$scope.document = data;
				$scope.document.tags = [];
				$scope.document.file_removed = false;
				Tag.document(documentID)
					.success(function(data){
						$scope.tags = data;
						angular.forEach(data, function(item){
							$scope.document.tags.push(item.name);
						});
						
					})
			})
			.error(function(){
				Preloader.error();
			});

		$scope.removeTag = function(idx){
			$scope.referenceTag.push($scope.tags[idx]);
		}

		$scope.removeFile = function(){
			$scope.document.file_removed = true;
		}

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
				if((!busy && $scope.pdfUploader.queue.length && $scope.document.file_removed) || (!busy && !$scope.document.file_removed)){
					busy = true;
					/* Starts Preloader */
					Preloader.saving();
					/**
					 * Stores Single Record
					*/
					if($scope.referenceTag.length){
						angular.forEach($scope.referenceTag, function(item){
							Tag.delete(item.id)
								.error(function(){
									Preloader.error;
								});
						});
					}

					Document.update(documentID, $scope.document)
						.success(function(){
							if($scope.pdfUploader.queue.length)
							{
								$scope.pdfUploader.uploadAll();
							}
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