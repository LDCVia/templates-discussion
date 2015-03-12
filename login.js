'use strict';

angular.module('ldcvia.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login.html',
    controller: 'LoginCtrl'
  });
}])

.controller('LoginCtrl', ['$scope', '$routeParams', 'RESTFactory', '$location', '$rootScope', '$cookieStore',
  function($scope, $routeParams, RESTFactory, $location, $rootScope, $cookieStore) {
    $scope.status = '';
  	$scope.login = function(data) {
      RESTFactory.login(data)
        .success(function(response) {
          if (!response.apikey){
            $scope.status = response.error;
          }else{
            $cookieStore.put('apikey', response.apikey);
            $cookieStore.put('username', response.email);
            $rootScope.apikey = response.apikey;
            $rootScope.user = response;
            headers.headers.apikey = $cookieStore.get('apikey');
            $location.path('/home');
          }
        })
        .error(function(error) {
          try{
            $scope.status = 'Error logging in: ' + error.message;
          }catch(e){
            
          }
        });
    }

}]);
