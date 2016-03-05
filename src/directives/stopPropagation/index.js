angular.module('cd').directive('cdStopPropagation', [function(){
	return {
		restrict: 'A',
		link: function(scope, element, attrs){
			element.on('click', function(e){
				e.stopPropagation();
			});
		}
	};
}]);