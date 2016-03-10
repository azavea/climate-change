(function () {
    'use strict';

    /** @ngInject */
    function CitySwitcherModalController($log, cities) {
        var vm = this;
        initialize();

        function initialize() {
            vm.cities = cities.features;
            vm.groupedCities = _(vm.cities)
              .groupBy(function (c) { return c.properties.continent; })
              .mapValues(function (group) { return _.take(group, 10); })
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