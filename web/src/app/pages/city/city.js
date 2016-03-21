(function () {
    'use strict';

    var NEAREST_KEY = 'nearest';

/** @ngInject */
    function CityPageController($log, $q, $state, $stateParams, City, IPGeolocation, OurDataConfig) {
        var vm = this;
        initialize();

        function initialize() {
            vm.tempChartConfig = {
                scenario: 'rcp45',
                chartOptions: {},
                indicators: [
                    {
                        key: 'monthly_average_max_temp',
                        label: 'Avg Monthly Max Temp'
                    }, {
                        key: 'monthly_average_min_temp',
                        label: 'Avg Monthly Min Temp'
                    },
                ],
                units: {
                    type: 'temp',
                    from: 'K',
                    to: 'C',
                }
            };
            vm.precipChartConfig = {
                scenario: 'rcp45',
                chartOptions: {},
                indicators: [
                    {
                        key: 'monthly_total_precip',
                        label: 'Total Monthly Precipitation'
                    },
                ],
                units: {
                    type: 'precip',
                    from: 'kgPerSquareMeterPerMonth',
                    to: 'inchesPerMonth',
                }
            };
            vm.cities = City.list();
            vm.cities.features.sort(function (a, b) {
                return b.properties.pop2010 - a.properties.pop2010;
            });
            vm.ourdata = OurDataConfig;

            findCity().then(function(city) {
                vm.city = city;
                return loadIndicators(city);
            }).then(function (cityData) {
                vm.indicators = cityData[0];
                vm.feelsLike = cityData[1];
                $log.debug(vm.indicators, vm.feelsLike);
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
            return $q.all([
                City.indicators(city.properties.name, city.properties.admin),
                City.feelslike(city.properties.name, city.properties.admin)
            ]);
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
