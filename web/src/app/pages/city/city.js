(function () {
    'use strict';

    var NEAREST_KEY = 'nearest';

/** @ngInject */
    function CityPageController($log, $q, $state, $stateParams, City, IPGeolocation) {
        var vm = this;
        initialize();

        function initialize() {
            vm.tempChartOptions = {};
            vm.cities = City.list();

            findCity().then(function(city) {
                vm.city = city;
                return loadIndicators(city);
            }).then(function (indicators) {
                vm.indicators = indicators;
                $log.debug(indicators);
            }).catch(onLoadError);
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
                dfd.reject({ message: 'Could not find requested city in list'});
            }
            return dfd.promise;
        }

        function loadIndicators(city) {
            return City.indicators(city.properties.name, city.properties.admin);
        }

        function onLoadError(error) {
            // An http request error
            if (error && error.status) {
                vm.error = 'Unable to load indicator data';
                $log.error(error);
            } else {
                $state.go('city', { cityId: NEAREST_KEY });
            }
        }
    }

    angular.module('cc.page.city')
    .controller('CityPageController', CityPageController);

})();
