(function () {
    'use strict';

    var SWITCHER_MODAL_DEFAULTS = {
        controller: 'CitySwitcherModalController',
        controllerAs: 'csmc',
        bindToController: true,
        size: 'lg',
        templateUrl: 'app/components/city/switcher/city-switcher-modal.html',
        windowClass: 'city-switcher-modal'
    };

    /** @ngInject */
    function CitySwitcherController($state, $uibModal) {
        var vm = this;
        initialize();

        function initialize() {
            vm.dropdownCities = _.take(vm.cities.features, 10);
            vm.openModal = openModal;
        }

        function openModal() {
            var options = angular.extend({}, SWITCHER_MODAL_DEFAULTS, {
                resolve: {
                    cities: function () { return vm.cities; }
                }
            });
            var modal = $uibModal.open(options);
            modal.result.then(function (city) {
                if (city && city.properties) {
                    $state.go('city', { cityId: city.properties.cartodb_id });
                }
            });
        }
    }

    /** @ngInject */
    function ccCitySwitcher() {
        var module = {
            restrict: 'EA',
            templateUrl: 'app/components/city/switcher/city-switcher.html',
            scope: {
                cities: '='
            },
            controller: 'CitySwitcherController',
            controllerAs: 'csc',
            bindToController: true
        };
        return module;
    }

    angular.module('cc.city.switcher')
    .controller('CitySwitcherController', CitySwitcherController)
    .directive('ccCitySwitcher', ccCitySwitcher);

})();