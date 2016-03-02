(function () {
    'use strict';

    var NEAREST_KEY = 'nearest';

/** @ngInject */
    function CityPageController($log, $state, $stateParams, City) {
        var vm = this;
        initialize();

        function initialize() {
            vm.cities = City.list();
            var requestedCity = _.find(vm.cities.features, function (f) {
                return f.properties.cartodb_id === parseInt($stateParams.cityId, 10);
            });
            if ($stateParams.cityId === NEAREST_KEY) {
                var position = turf.point([-75.245012, 39.979495]);
                vm.city = City.nearest(position);
            } else if (requestedCity) {
                vm.city = requestedCity;
            } else {
                $state.go('city', { cityId: NEAREST_KEY });
            }
            $log.debug(vm.city);
        }
    }

    angular.module('cc.page.city')
    .controller('CityPageController', CityPageController);

})();
