/*
Basic configuration of the application
*/

xcomponents.appVersion = '201504151600';
xcomponents.host = 'https://' + gup('host') + '/1.0';
xcomponents.db = gup('db');
xcomponents.apikey = null;
xcomponents.readonly = false;
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
  icon: 'fa-calendar'
}, {
  label: 'By Category',
  url: '#/category',
  icon: 'fa-list'
}, {
  label: 'By Author',
  url: '#/author',
  icon: 'fa-user'
}];

xcomponents.footerOptions = [{
  label: 'By Date',
  url: '#/home',
  icon: 'fa-calendar'
}, {
  label: 'By Category',
  url: '#/category',
  icon: 'fa-list'
}, {
  label: 'By Author',
  url: '#/author',
  icon: 'fa-user'
}];
xcomponents.footerTitle = "LDC Via Discussion using XComponents (" + xcomponents.appVersion + ")";

/*
Define the main Topic model
*/
xcomponents.models['MainTopic'] = {
  name: 'MainTopic',
  fields: [{
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
    options: {
      endpoint: xcomponents.host + '/list/' + xcomponents.db + '/MainTopic/Categories'
    },
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
  }]
};

xcomponents.models['Response'] = {
  name: 'Response',
  fields: [{
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
  }]
};

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
    $routeProvider.when('/author', {
      templateUrl: 'author.html',
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
    //Notes Name filter
    app.filter('text', function() {

        return function(input) {
          return input;
        };
      })
    //Implode List Filter
  app.filter('implodelist', function() {
      return function(input) {
        if (Array.isArray(input)) {
          return input.join(", ");
        } else {
          return input;
        }
      }
    })
    //HTML Filter
  app.filter('html', ['$sce', '$cookieStore', function($sce, $cookieStore) {
    return function(input, selectedItem) {
      if (selectedItem){
        var prefix = xcomponents.host + "/attachment/" + xcomponents.db + "/" + selectedItem.__form + "/" + selectedItem.__unid + "/";
        var div = document.createElement('div');
        div.innerHTML = input;
        var imgs = div.getElementsByTagName('img');
        for(var i=0; i<imgs.length; i++){
          var img = imgs[i];
          if (selectedItem._files){
            var src = img.src.replace("cid:", "");
            src = src.split("/");
            src = src[src.length - 1];
            for (var k=0; k<selectedItem._files.length; k++){
              if (selectedItem._files[k].indexOf(src) > -1){
                img.src = prefix + selectedItem._files[k] + "?apikey=" + $cookieStore.get('apikey');
              }
            }
          }
        }
        input = div.innerHTML;
      }
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
    bootcards.init( {
	        offCanvasHideOnMainClick : true,
	        offCanvasBackdrop : false,
	        enableTabletPortraitMode : true,
	        disableRubberBanding : true,
	        disableBreakoutSelector : 'a.no-break-out'
	      });
    $scope.login = function(data) {
      var error = false;
      if (!xcomponents.host || xcomponents.host == null || xcomponents.host == "" || gup('host') == ""){
        $scope.status = "The page has encountered an error: You must specify a host in the address";
        error = true;
      }
      if (!xcomponents.db || xcomponents.db == null || xcomponents.db == "" || gup('db') == ""){
        $scope.status = "The page has encountered an error: You must specify a db in the address";
        error = true;
      }
      if (!data || data.username == "" || data.password == ""){
        $scope.status = "The page has encountered an error: You must specify a username and password";
        error = true;
      }
      if (!error){
        $scope.status = "Logging in...";
        RESTFactory.login(xcomponents.host + '/login', data)
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
              if (document.location.port != 80 && document.location.port != 443) {
                port = ":" + document.location.port;
              }
              window.location = document.location.protocol + "//" + document.location.hostname + port + document.location.pathname + '?host=' + gup('host') + '&db=' + gup('db');
            }
          })
          .error(function(error) {
            try {
              if (error.error){
                $scope.status = 'Error logging in: ' + error.error;
              }else{
                $scope.status = 'Error logging in: ' + error.message;
              }
            } catch (e) {
              $scope.status = 'There was an error logging in';
            }
          });
      }
    }

  }
]);

function gup(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
    return "";
  else
    return results[1];
}
