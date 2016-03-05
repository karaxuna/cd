/* global angular */
var app = angular.module('docs', ['cd']);

// ctrl
angular.module('docs').controller('example1Ctrl', ['$scope', function (scope) {
    scope.options = {
        reload: function () {
            return {
                total: 2,
                records: [{
                    caption: 'one',
                    value: 1
                }, {
                    caption: 'two',
                    value: 2
                }]
            };
        }
    }
}]);

// bootstrap angular
window.addEventListener('load', function () {
    angular.bootstrap(document, [app.name]);
});