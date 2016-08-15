var adminModule = angular.module('admin', [
	'sharedModule',
]);
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
adminModule
	.controller('categoryContentContainerController', ['$scope', '$state', '$stateParams', '$mdDialog', 'Category', 'Document', 'Preloader', 'User', function($scope, $state, $stateParams, $mdDialog, Category, Document, Preloader, User){
		var categoryID = $stateParams.categoryID;
		/**
		 * Object for toolbar
		 *
		*/
		$scope.toolbar = {};
		$scope.toolbar.showBack = true;

		$scope.searchUserInput = function(){
			$scope.document.show = false;
			Preloader.loading();
			Document.search($scope.toolbar, categoryID)
				.success(function(data){
					$scope.document.results = data;
					Preloader.stop();
				})
				.error(function(){
					Preloader.error();
				});
		};

		Category.show(categoryID)
			.success(function(data){
				if(data.groups.length){
					var groups = [];

					angular.forEach(data.groups, function(item){
						groups.push(item.id);
					})

					User.checkFileAccess(groups)
						.success(function(allowed){
							if(!allowed){
								$state.go('page-not-found');
							}
						})
				}

				$scope.category = data;
				$scope.toolbar.childState = data.name;
			})
			.error(function(){
				Preloader.error();
			});

		$scope.document = {};
		$scope.document.paginated = [];
		// 2 is default so the next page to be loaded will be page 2 
		$scope.document.page = 2;

		Document.paginateCategory(categoryID)
			.success(function(data){
				$scope.document.details = data;
				$scope.document.paginated = data.data;
				$scope.document.show = true;

				$scope.document.paginateLoad = function(){
					// kills the function if ajax is busy or pagination reaches last page
					if($scope.document.busy || ($scope.document.page > $scope.document.details.last_page)){
						return;
					}
					/**
					 * Executes pagination call
					 *
					*/
					// sets to true to disable pagination call if still busy.
					$scope.document.busy = true;

					Document.paginateCategory(categoryID, $scope.document.page)
						.success(function(data){
							// increment to call the next page for the next call
							$scope.document.page++;
							// iterate over the paginated data and push it to the original array
							angular.forEach(data.data, function(item){
								$scope.document.paginated.push(item);
							});
							// Enables again the pagination call for next call.
							$scope.report.busy = false;
						})
						.error(function(){
							Preloader.error();
						});
				}
			})
			.error(function(){
				Preloader.error();
			});	

		$scope.refresh = function(){
        	Preloader.loading();
			$scope.toolbar.userInput = '';
			
			$scope.document = {};
			$scope.document.show = false;
			$scope.document.paginated = [];
			// 2 is default so the next page to be loaded will be page 2 
			$scope.document.page = 2;

			Document.paginateCategory(categoryID)
				.success(function(data){
					$scope.document.details = data;
					$scope.document.paginated = data.data;
					$scope.document.show = true;
					/* stops both preloader*/
					Preloader.stop();
					Preloader.stop();
				})
				.error(function(){
					Preloader.error();
				});
		};

		$scope.fab = {};

		$scope.fab.show = true;
		$scope.fab.icon = 'mdi-plus';
		$scope.fab.label = 'File';
		$scope.fab.action = function(){
			$mdDialog.show({
		    	controller: 'addDocumentDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/add-document-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		};	

		$scope.openFile = function(id){
			var win = window.open('/document-view/' + id + '/category/' + categoryID);
			win.focus();
		}

		$scope.edit = function(id){
			Preloader.set(id);
			$mdDialog.show({
		    	controller: 'editDocumentDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/edit-document-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		}

		$scope.delete = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Delete File')
		        .textContent('Are you sure you want to delete this file ?')
		        .ariaLabel('Delete File')
		        .ok('Delete')
		        .cancel('Cancel');
		    $mdDialog.show(confirm).then(function() {
		    	Preloader.loading();
		    	Document.delete(id)
		    		.success(function(){
		    			Preloader.stop();
		    			$scope.refresh();
		    		})
		    		.error(function(){
		    			Preloader.error();
		    		});
		    }, function() {
		    	return;
		    });
		}
	}]);
adminModule
	.controller('mainContentContainerController', ['$scope', '$state', '$mdDialog', 'Category', 'Document', 'Preloader', 'User', function($scope, $state, $mdDialog, Category, Document, Preloader, User){
		$scope.show = {};
		
		$scope.refresh = function(){
			$scope.toolbar.userInput = '';
        	Preloader.loading();
			$scope.init(true);
		}
		
		/**
		 * Object for toolbar
		 *
		*/
		$scope.toolbar = {};
		$scope.toolbar.childState = 'Home';

		$scope.searchUserInput = function(){
			if($scope.toolbar.userInput){
				$scope.show.categories = false;
				Preloader.loading();
				Document.search($scope.toolbar)
					.success(function(data){
						angular.forEach(data.groups, function(group){
							group.documents = [];
							
							angular.forEach(group.categories, function(category){
								angular.forEach(category.documents, function(document){
									group.documents.push(document);
								});
							});
						});
						$scope.result = data;
						Preloader.stop();
					})
					.error(function(){
						Preloader.error();
					});
			}
		};

		$scope.fab = {};

		$scope.fab.show = true;
		$scope.fab.icon = 'mdi-plus';
		$scope.fab.label = 'Category';
		$scope.fab.action = function(){
			$mdDialog.show({
		    	controller: 'addCategoryDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/add-category-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		};	

		$scope.viewCategory = function(id){
			$state.go('main.category', {'categoryID': id});
		};

		$scope.openFile = function(id, categoryID){
			var win = window.open('/document-view/' + id + '/category/' + categoryID);
			win.focus();
		}

		$scope.viewDescription = function(data){
			$mdDialog.show(
			    $mdDialog.alert()
			    	.parent(angular.element(document.body))
			        .clickOutsideToClose(true)
			        .title('Description')
			        .textContent(data)
			        .ariaLabel('Description')
			        .ok('Okay')
			);
		}

		$scope.editFolder = function(id){
			Preloader.set(id);
			$mdDialog.show({
		    	controller: 'editCategoryDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/add-category-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		}

		$scope.edit = function(id){
			Preloader.set(id);
			$mdDialog.show({
		    	controller: 'editDocumentDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/edit-document-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function() {
	          	$scope.refresh();
	        });
		}

		$scope.deleteCategory = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Delete category')
		        .textContent('Are you sure you want to delete this category ?')
		        .ariaLabel('Delete Category')
		        .ok('Delete')
		        .cancel('Cancel');
		    $mdDialog.show(confirm).then(function() {
		    	Preloader.loading();
		    	Category.delete(id)
		    		.success(function(){
		    			Preloader.stop();
		    			$scope.refresh();
		    		})
		    		.error(function(){
		    			Preloader.error();
		    		});
		    }, function() {
		    	return;
		    });
		}

		$scope.delete = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Delete File')
		        .textContent('Are you sure you want to delete this file ?')
		        .ariaLabel('Delete File')
		        .ok('Delete')
		        .cancel('Cancel');
		    $mdDialog.show(confirm).then(function() {
		    	Preloader.loading();
		    	Document.delete(id)
		    		.success(function(){
		    			Preloader.stop();
		    			$scope.refresh();
		    		})
		    		.error(function(){
		    			Preloader.error();
		    		});
		    }, function() {
		    	return;
		    });
		}

		// Init the content of the page
		$scope.init = function(refresh){
			User.index()
				.then(function(data){
					$scope.user = data.data;
					
					$scope.groups = [];

					angular.forEach($scope.user.groups, function(group){
						$scope.groups.push(group.id);
					});

					return $scope.groups;
				})
				.then(function(groups){
					Category.index()
						.success(function(data){
							$scope.public = data;
							$scope.show.categories = true;
						})

					Category.userGroups($scope.groups)
						.success(function(data){
							$scope.private = data;

							if(refresh){
								Preloader.stop();
								Preloader.stop();
							}

						})
						.error(function(){
							Preloader.error();
						});
				})
		}

		$scope.init();
	}]);
adminModule
	.controller('settingsContentContainerController', ['$scope', '$state', '$mdDialog', 'Preloader', 'Group', 'User', function($scope, $state, $mdDialog, Preloader, Group, User){
		/**
		 * Object for toolbar
		 *
		*/
		$scope.toolbar = {};
		$scope.toolbar.childState = 'Settings';

		$scope.refresh = function(){
			Preloader.loading();
			$scope.init(true);
		}

		$scope.createGroup = function(){
			$mdDialog.show({
		    	controller: 'createGroupDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/group-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function(){
	        	$scope.refresh();
	        }, function() {
	        	return;
	        });
		}

		$scope.editGroup = function(id){
			Preloader.set(id);
			$mdDialog.show({
		    	controller: 'editGroupDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/group-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function(){
	        	$scope.refresh();
	        }, function() {
	        	return;
	        });
		}

		$scope.deleteGroup = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Delete Group')
		        .textContent('This group will be removed permanently.')
		        .ariaLabel('Delete Group')
		        .ok('Delete')
		        .cancel('Cancel');

		    $mdDialog.show(confirm)
		    	.then(function() {
			    	Group.delete(id)
			    		.success(function(){
			    			$scope.refresh();
			    			Preloader.deleted();
			    		})
			    		.error(function(){
			    			Preloader.error();
			    		});
			    }, function() {
			    	return;
			    });
		}	

		$scope.createUser = function(){
			$mdDialog.show({
		    	controller: 'createUserDialogController',
		      	templateUrl: '/app/components/admin/templates/dialogs/create-user-dialog.template.html',
		      	parent: angular.element(document.body),
		    })
	        .then(function(){
	        	$scope.refresh();
	        }, function() {
	        	return;
	        });
		}

		$scope.resetPassword = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Reset Password')
		        .textContent('Reset the password for this account?')
		        .ariaLabel('Reset Password')
		        .ok('Reset')
		        .cancel('Cancel');

		    $mdDialog.show(confirm)
		    	.then(function() {
			    	User.resetPassword(id)
			    		.success(function(){
			    			Preloader.toastChangesSaved();
			    		})
			    		.error(function(){
			    			Preloader.error();
			    		});
			    }, function() {
			    	return;
			    });
		}

		$scope.deleteAccount = function(id){
			var confirm = $mdDialog.confirm()
		        .title('Delete Account')
		        .textContent('This account will be removed permanently.')
		        .ariaLabel('Delete Account')
		        .ok('Delete')
		        .cancel('Cancel');

		    $mdDialog.show(confirm)
		    	.then(function() {
			    	User.delete(id)
			    		.success(function(){
			    			$scope.refresh();
			    			Preloader.deleted();
			    		})
			    		.error(function(){
			    			Preloader.error();
			    		});
			    }, function() {
			    	return;
			    });
		}

		$scope.init = function(refresh){
			User.index()
				.success(function(data){
					if(data.role != 'super-admin'){
						$state.go('page-not-found');
					}

					$scope.current_user = data;
				});

			Group.index()
				.then(function(data){
					$scope.groups = data.data;
				})
				.then(function(){
					User.others()
						.success(function(data){
							$scope.users = data;

							if(refresh){
								Preloader.stop();
								Preloader.stop();
							}
						})
						.error(function(){
							Preloader.error();
						});
				}, function(){
					Preloader.error();
				});
		}

		$scope.init();
	}]);
adminModule
	.controller('addCategoryDialogController', ['$scope', '$mdDialog', 'Category', 'Preloader', 'User', 'CategoryGroup', function($scope, $mdDialog, Category, Preloader, User, CategoryGroup){
		$scope.category = {};
		$scope.category.groups = [];
		User.index()
			.success(function(data){
				$scope.groups = data.groups;
			});

		var busy = false;

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		$scope.submit = function(){
			if($scope.addCategoryForm.$invalid){
				angular.forEach($scope.addCategoryForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else{
				/* Starts Preloader */
				// Preloader.loading();
				/**
				 * Stores Single Record
				*/
				if(!busy){
					if(($scope.private && $scope.category.groups.length) || (!$scope.private && !$scope.category.groups.length)){
						busy = true;
						Category.store($scope.category)
							.success(function(data){
								if(data){
									angular.forEach($scope.category.groups, function(item){
										item.category_id = data;
									});

									CategoryGroup.store($scope.category.groups)
										.success(function(){
											// Stops Preloader 
											Preloader.stop();
											busy = false;		
										})
								}
								else{
									// Stops Preloader 
									Preloader.stop();
									busy = false;
								}
							})
							.error(function(){
								Preloader.error()
							});
					}
					else{
						$scope.show = true;
					}
				}
			}
		}
	}]);
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
adminModule
	.controller('changePasswordDialogController', ['$scope', '$mdDialog', 'User', 'Preloader', function($scope, $mdDialog, User, Preloader){
		$scope.password = {};

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		$scope.checkPassword = function(){
			User.checkPassword($scope.password)
				.success(function(data){
					$scope.match = data;
					$scope.show = true;
					console.log($scope.match);
				});
		}

		$scope.submit = function(){
			$scope.showErrors = true;
			if($scope.changePasswordForm.$invalid){
				angular.forEach($scope.changePasswordForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else if($scope.password.old == $scope.password.new || $scope.password.new != $scope.password.confirm)
			{
				return;
			}
			else {
				Preloader.saving();

				User.changePassword($scope.password)
					.success(function(){
						Preloader.stop();
					})
					.error(function(){
						Preloader.error();
					});
			}
		}
	}]);
adminModule
	.controller('createGroupDialogController', ['$scope', '$mdDialog', 'Group', 'GroupUser', 'Preloader', 'User', function($scope, $mdDialog, Group, GroupUser, Preloader, User){
		$scope.group = {};
		$scope.group.users = [];
		var busy = false;

		User.all()
			.success(function(data){
				$scope.users = data;
			});

		$scope.checkDuplicate = function(){
			$scope.duplicate = false;
			Group.checkDuplicate($scope.group)
				.success(function(data){
					$scope.duplicate = data;
				});
		}

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		$scope.submit = function(){
			if($scope.createGroupForm.$invalid){
				angular.forEach($scope.createGroupForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else{
				/* Starts Preloader */
				// Preloader.loading();
				/**
				 * Stores Single Record
				*/
				$scope.show = true;
				if(!busy && !$scope.duplicate && $scope.group.users.length){
					busy = true;
					Group.store($scope.group)
						.success(function(data){
							busy = false;
							if(!typeof(data) === 'string'){
								$scope.duplicate = data;
							}
							else if(typeof(data) === 'string'){
								angular.forEach($scope.group.users, function(item){
									item.group_id = data;
								});

								GroupUser.store($scope.group.users)
									.success(function(){
										Preloader.stop();
									})
									.error(function(){
										Preloader.error();
									})
							}
						})
						.error(function(){
							Preloader.error()
						});
				}
			}
		}
	}]);
adminModule
	.controller('createUserDialogController', ['$scope', '$mdDialog', 'User', 'Preloader', function($scope, $mdDialog, User, Preloader){
		$scope.user = {};
		$scope.user.role = 'admin';
		var busy = false;

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		$scope.checkEmail = function(){
			$scope.duplicate = false;
			User.checkEmail($scope.user)
				.success(function(data){
					$scope.duplicate = data;
				})
				.error(function(){
					Preloader.error();
				})
		}

		$scope.submit = function(){
			$scope.showErrors = true;
			if($scope.userForm.$invalid){
				angular.forEach($scope.userForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else if($scope.user.password != $scope.user.password_confirmation || $scope.duplicate)
			{
				return;
			}
			else {
				if(!busy && !$scope.duplicate)
				{
					// Preloader.saving();
					busy = true;

					User.store($scope.user)
						.success(function(data){
							if(!data){
								Preloader.stop();
								busy = false;
							}
						})
						.error(function(){
							Preloader.error();
							busy = false;
						});
				}
			}
		}
	}]);
adminModule
	.controller('editCategoryDialogController', ['$scope', '$mdDialog', 'Category', 'Preloader', 'User', 'CategoryGroup', function($scope, $mdDialog, Category, Preloader, User, CategoryGroup){
		var categoryID = Preloader.get();

		User.index()
			.then(function(data){
				$scope.groups = data.data.groups;

				return data.data;
			})
			.then(function(groups){
				// console.log(groups);
				Category.show(categoryID)
					.success(function(data){
						$scope.private = data.groups.length ? true : false;
						$scope.category = data;
						$scope.category.groups = [];

						angular.forEach($scope.groups, function(item, key){
							$scope.category.groups.push(null);
							CategoryGroup.relation(categoryID, item.id)
								.success(function(related){
									if(related){
										$scope.category.groups.splice(key, 1, item);
									}
								})
						});
					});
			})

		
		var busy = false;

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		$scope.submit = function(){
			if($scope.addCategoryForm.$invalid){
				angular.forEach($scope.addCategoryForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else{
				/* Starts Preloader */
				// Preloader.loading();
				/**
				 * Stores Single Record
				*/
				if($scope.private){
					$scope.count = 0;

					angular.forEach($scope.category.groups, function(item){
						if(item){
							$scope.count++;
						}
					});

					if(!$scope.count){
						$scope.show = true;
					}
				}

				if(!busy){;
					if(($scope.private && $scope.count) || (!$scope.private)){
						busy = true;
						Category.update(categoryID, $scope.category)
							.success(function(data){
								if(data){
									if($scope.private){
										angular.forEach($scope.category.groups, function(item){
											if(item){
												item.category_id = data;
												item.include = true;
											}
										});
									}

									CategoryGroup.update(categoryID, $scope.category.groups)
										.success(function(){
											// Stops Preloader 
											Preloader.stop();
											busy = false;		
										})
								}
								else{
									// Stops Preloader 
									busy = false;
									Preloader.stop();
								}
							})
							.error(function(){
								Preloader.error()
							});
					}
				}
			}
		}
	}]);
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
adminModule
	.controller('editGroupDialogController', ['$scope', '$mdDialog', 'Group', 'Preloader', 'User', 'GroupUser', function($scope, $mdDialog, Group, Preloader, User, GroupUser){
		var groupID = Preloader.get();
		var busy = false;

		$scope.checkDuplicate = function(){
			$scope.duplicate = false;
			Group.checkDuplicate($scope.group)
				.success(function(data){
					$scope.duplicate = data;
				});
		}

		$scope.cancel = function(){
			$mdDialog.cancel();
		}


		Group.show(groupID)
			.success(function(data){
				$scope.group = data;
				$scope.group.users = [];
				var count = 0;
				
				User.all()
					.success(function(data){
						$scope.users = data;

						angular.forEach(data, function(user, idx){
							$scope.group.users.push(null);
							GroupUser.relation($scope.group.id, user.id)
								.success(function(related){
									if(related){
										$scope.group.users.splice(idx, 1, user);
									}
								})
						});
					});


			})

		$scope.submit = function(){
			if($scope.createGroupForm.$invalid){
				angular.forEach($scope.createGroupForm.$error, function(field){
					angular.forEach(field, function(errorField){
						errorField.$setTouched();
					});
				});
			}
			else{
				/* Starts Preloader */
				// Preloader.loading();
				/**
				 * Stores Single Record
				*/
				$scope.count = 0;
				angular.forEach($scope.group.users, function(item){
					if(item){
						$scope.count++;
					}
				});

				if(!$scope.count){
					$scope.show = true;
				}

				if(!busy && !$scope.duplicate && $scope.count){
					busy = true;
					Group.update(groupID, $scope.group)
						.success(function(data){
							busy = false;
							if(!typeof(data) === 'string'){
								$scope.duplicate = data;
							}
							else if(typeof(data) === 'string'){
								angular.forEach($scope.group.users, function(item){
									if(item){
										item.group_id = data;
									}
								});

								GroupUser.update(groupID, $scope.group.users)
									.success(function(){
										Preloader.stop();
									})
									.error(function(){
										Preloader.error();
									})
							}
						})
						.error(function(){
							Preloader.error()
						});
				}
			}
		}
	}]);
//# sourceMappingURL=admin.js.map
