angular.module('docs').controller('appCtrl', ['$scope', function (scope) {
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