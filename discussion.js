/*
Basic configuration of the application
*/

xcomponents.appVersion = '0.1';
xcomponents.host = 'https://' + gup('host') + '/1.0';
xcomponents.db = gup('db');
xcomponents.apikey = null;
xcomponents.documentURL = xcomponents.host + '/document/' + xcomponents.db + '/MainTopic/:id';
xcomponents.responseURL = xcomponents.host + '/responses/' + xcomponents.db + '/MainTopic/:id?expand=true';
/*
Define Header and Footer options
*/
xcomponents.menuOptions = [{
  label: 'Logout',
  isSecondary: true,
  icon: 'fa-sign-out',
  logout: true
}, {
  label: 'By Date',
  url: '#/home',
  icon: 'fa-dashboard'
}, {
  label: 'By Category',
  url: '#/category',
  icon: 'fa-list'
}
];
xcomponents.footerOptions = [{
  label: 'By Date',
  url: '#/home',
  icon: 'fa-dashboard'
}, {
  label: 'By Date',
  url: '#/category',
  icon: 'fa-list'
}];
xcomponents.footerTitle = "LDC Via Discussion using XComponents (alpha 1)";

/*
Define the main Topic model
*/
xcomponents.modelName = 'Topic';
xcomponents.fields = [{
  label: 'Subject',
  field: 'Subject',
  required: true
}, {
  label: 'Created By',
  field: 'From',
  type: 'notesname',
  edit: false,
  read: true
}, {
  label: 'Category',
  field: 'Categories',
  type: 'implodelist',
  read: true,
  edit: false
}, {
  label: 'Category',
  field: 'Categories',
  type: 'select-multiple',
  options: { endpoint:xcomponents.host + '/list/' + xcomponents.db + '/MainTopic/Categories'},
  read: false,
  edit: true
}, {
  label: 'Date Created',
  field: '__created',
  type: 'date',
  edit: false
}, {
  label: 'Body',
  field: 'Body__parsed',
  type: 'html',
  read: true,
  edit: false
}, {
  label: 'Body',
  field: 'Body__parsed',
  type: 'html',
  read: false,
  edit: true
}, {
  label: 'Files',
  field: '_files',
  type: 'files',
  read: true,
  edit: false
}, {
  label: '',
  field: 'file',
  type: 'files',
  read: false,
  edit: true
}];

/*
 Inject custom code for LDC Via handling
*/
xcomponents.addCallback(function() {

  var app = angular.module('xcomponents');

  app.run(['$http', '$cookieStore', function($http, $cookieStore) {
    console.log("Setting apikey in Login Controller for " + $cookieStore.get('username'));
    $http.defaults.headers.common['apikey'] = $cookieStore.get('apikey');
  }]);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'home.html',
      controller: 'xcController'
    });
    $routeProvider.when('/category', {
      templateUrl: 'category.html',
      controller: 'xcController'
    });
    $routeProvider.
    otherwise({
      redirectTo: '/home'
    });
  }])

  //Notes Name filter
  app.filter('notesname', function() {

    return function(input) {

      if (!input) {
        return "";
      }
      try {
        input = JSON.parse(input);
      } catch (e) {
        input = [input];
      }
      var out = [];
      for (var i = 0; i < input.length; i++) {
        var name = input[i];
        if (name.indexOf("CN=") > -1) {
          name = name.replace("CN=", "");
          name = name.replace("OU=", "");
          name = name.replace("O=", "");
        }
        out.push(name);
      }
      return out.join(",");
    };
  })
  //Implode List Filter
  app.filter('implodelist', function() {
    return function(input) {
      if (Array.isArray(input)){
        return input.join(", ");
      }else{
        return input;
      }
    }
  })
  //HTML Filter
  app.filter('html', ['$sce', function($sce){
    return function(input){
      return $sce.trustAsHtml(input);
    }
  }]);

});

angular.module('ldcvia.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login.html',
    controller: 'LoginCtrl'
  });
}])

.controller('LoginCtrl', ['$scope', '$routeParams', 'RESTFactory', '$location', '$rootScope', '$cookieStore', 'xcUtils',
  function($scope, $routeParams, RESTFactory, $location, $rootScope, $cookieStore, xcUtils) {
    $scope.status = '';
    $scope.login = function(data) {
      RESTFactory.login(xcUtils.getConfig('host') + '/login', data)
        .success(function(response) {
          if (!response.apikey) {
            $scope.status = response.error;
          } else {
            $cookieStore.put('apikey', response.apikey);
            $cookieStore.put('username', response.email);
            $rootScope.apikey = response.apikey;
            $rootScope.username = response.email;
            var app = angular.module('xcomponents');
            var port = "";
            if (document.location.port != 80 && document.location.port != 443){
              port = ":" + document.location.port;
            }
            window.location = document.location.protocol +"//"+ document.location.hostname + port + document.location.pathname + '?host=' + gup('host') + '&db=' + gup('db');
          }
        })
        .error(function(error) {
          try {
            $scope.status = 'Error logging in: ' + error.message;
          } catch (e) {

          }
        });
    }

  }
]);

function gup( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}
