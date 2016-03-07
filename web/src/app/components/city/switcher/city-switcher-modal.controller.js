(function () {
    'use strict';

    /** @ngInject */
    function CitySwitcherModalController($log, cities) {
        var vm = this;
        initialize();

        function initialize() {
            vm.cities = _(cities.features)
              .sortBy(function (c) { return c.properties.name; })
              .groupBy(function (c) { return c.properties.continent; })
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