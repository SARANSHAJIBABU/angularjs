var app = angular.module("myApp",[]);

app.config(function($routeProvider){
	$routeProvider.when('/',{
		templateUrl: "templates/home.html" ,
		controller:'HomeController'
	})
	.when('/settings',{
		templateUrl: 'templates/settings.html',
		controller:'SettingsController'
	})
	.otherwise({
		redirectTo:'/'
	});
});

app.service('mailService',['$http','$q',function($http,$q){
	var getMail = function(){
		return 	$http({
			method:"GET",
			url:'/api/mail'
		});

	};

	var sendEmail = function(mail){
		var d = $q.defer();
		$http({
			method:"POST",
			data:mail,
			url:'/api/send'
		}).success(function(data,status,header){
			d.resolve(data);
		}).error(function(data,status,header){
			d.reject(data);
		});
		return d.promise;
	};

	return{
		getMail:getMail;
		sendEmail:sendEmail;
	}
}]);


app.controller('HomeController', function($scope){
	$scope.selectedMail;

	$scope.setSelectedMail = function(mail){
		$scope.selectedMail = mail;
	}

	$scope.isSelectedMail(mail){
		return mail === $scope.selectedMail;
	}
});

app.controller('SettingsController', function($scope){
	$scope.name = {
		name:"Ari",
		email:"me@example.com"
	};

	$scope.updateSettings=function(){
		console.log("updateSettings was called");
	};
});

app.controller('MailListingController',['$scope','mailService',function($scope,mailService){
	$scope.email =[];

mailService.getMail()
.success(function(data,status,headers){
		$scope.email = data.all;
	}).error(function(data,status,headers){

	});
}]);

app.controller('ContentController', ['$scope','$rootScope','mailService',function($scope,mailService,$rootScope){
	$scope.showingReply = false;
	$scope.reply={};

	$scope.toggleReplyForm = function(){
		$scope.showingReply = !$scope.showingReply;
		$scope.reply = {};
		$scope.reply.to = $scope.selectedMail.from.join(",");
		$scope.reply.body = "\n\n------\n\n"+$scope.selectedMail.body;
	};

	$scope.$watch('selectedMail',function(evt){
		$scope.showingReply = false;
		$scope.reply = {};
	});

	$scope.sendReply = function(){
		$scope.showingReply = false;
		$rootScope.loading = true;
		mailService.sendEmail($scope.reply).
		then(function(status){
			$rootScope.loading = false;
		}, function(err){
			$rootScope.loading = false;
		});
	};
}]);




