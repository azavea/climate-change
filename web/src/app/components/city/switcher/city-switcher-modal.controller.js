(function () {
    'use strict';

    /** @ngInject */
    function CitySwitcherModalController($log, cities) {
        var vm = this;
        initialize();

        function initialize() {
            vm.cities = cities;
            $log.debug(cities);
        }
    }

    angular.module('cc.city.switcher')
    .controller('CitySwitcherModalController', CitySwitcherModalController);

})();