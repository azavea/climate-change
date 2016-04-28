(function () {
    'use strict';

    /** @ngInject */
    function CitySwitcherModalController($log, cities) {
        var vm = this;
        initialize();

        function initialize() {
            vm.cities = cities.features;
            vm.groupedCities = _(vm.cities)
              .groupBy(function (c) { return c.properties.region_wb; })
              .value();
            // For correct rendering, organize city groups into groups of 4
            vm.regionKeysBy4 = _.chunk(Object.keys(vm.groupedCities), 4);

            vm.onCityClicked = onCityClicked;
            vm.onRegionSelected = onRegionSelected;
            vm.onRegionCleared = onRegionCleared;
        }

        function onCityClicked(city) {
            vm.$close(city);
        }

        function onRegionSelected(region){
            vm.selectedRegion = vm.groupedCities[region];
            vm.selectedRegion.name = region;
        }

        function onRegionCleared(){
            vm.selectedRegion = false;
            vm.selectedRegion.name = '';
        }
    }

    angular.module('cc.city.switcher')
    .controller('CitySwitcherModalController', CitySwitcherModalController);

})();