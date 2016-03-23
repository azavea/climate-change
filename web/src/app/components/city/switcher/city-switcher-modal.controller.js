(function () {
    'use strict';

    /** @ngInject */
    function CitySwitcherModalController($log, cities) {
        var vm = this;
        initialize();

        function initialize() {
            vm.cities = cities.features;
            vm.groupedCities = _(vm.cities)
              .sortBy('properties.admin', 'properties.name')
              .groupBy(function (c) { return c.properties.region_wb; })
              .value();

            vm.onCityClicked = onCityClicked;
        }

        function onCityClicked(city) {
            vm.$close(city);
        }
    }

    angular.module('cc.city.switcher')
    .controller('CitySwitcherModalController', CitySwitcherModalController);

})();