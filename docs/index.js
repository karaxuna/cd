/* global angular */
var app = angular.module('docs', ['ui.router', 'cd']);

// define states
app.config(['$stateProvider', function (stateProvider) {
    stateProvider.state('app', {
        url: '',
        templateUrl: './app/index.html',
        controller: 'appCtrl'
    });
}]);

// bootstrap angular
window.addEventListener('load', function () {
    angular.bootstrap(document, [app.name]);
});