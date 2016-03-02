(function () {
    'use strict';

    var NEAREST_KEY = 'nearest';

/** @ngInject */
    function CityPageController($log, $q, $state, $stateParams, City, IPGeolocation) {
        var vm = this;
        initialize();

        function initialize() {
            vm.cities = City.list();

            findCity().then(function (city) {
                vm.city = city;
            }).catch(function () {
                $state.go('city', { cityId: NEAREST_KEY });
            });
        }

        function findCity() {
            if ($stateParams.cityId === NEAREST_KEY) {
                return IPGeolocation.get().then(function (point) {
                    return City.nearest(point);
                });
            }
            // Otherwise try to get city from the cities list
            var dfd = $q.defer();
            var requestedCity = _.find(vm.cities.features, function (f) {
                return f.properties.cartodb_id === parseInt($stateParams.cityId, 10);
            });
            if (requestedCity) {
                dfd.resolve(requestedCity);
            } else {
                dfd.reject('Unable to set city');
            }
            return dfd.promise;
        }
    }

    angular.module('cc.page.city')
    .controller('CityPageController', CityPageController);

})();
