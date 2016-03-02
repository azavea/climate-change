(function () {
    'use strict';

    var SWITCHER_MODAL_DEFAULTS = {
        controller: 'CitySwitcherModalController',
        controllerAs: 'csmc',
        bindToController: true,
        size: 'lg',
        templateUrl: 'app/components/city/switcher/city-switcher-modal.html'
    };

    /** @ngInject */
    function CitySwitcherController($uibModal) {
        var vm = this;
        initialize();

        function initialize() {
            vm.cities = [];
            vm.openModal = openModal;
        }

        function openModal() {
            var options = angular.extend({}, SWITCHER_MODAL_DEFAULTS, {
                resolve: {
                    cities: function () { return vm.cities; }
                }
            });
            var modal = $uibModal.open(options);
        }
    }

    /** @ngInject */
    function ccCitySwitcher() {
        var module = {
            restrict: 'EA',
            templateUrl: 'app/components/city/switcher/city-switcher.html',
            scope: true,
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