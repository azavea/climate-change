(function () {
    'use strict';

    /** @ngInject */
    function CityMapController() {
        var vm = this;
        initialize();

        function initialize() {

        }
    }

    /** @ngInject */
    function ccCityMap() {
        var module = {
            restrict: 'EA',
            templateUrl: 'app/components/city/map/city-map.html',
            scope: true,
            controller: 'CityMapController',
            controllerAs: 'cmc',
            bindToController: true,
            link: link
        };
        return module;

        function link(scope, element, attrs, controller) {

        }
    }

    angular.module('cc.city.map')
    .controller('CityMapController', CityMapController)
    .directive('ccCityMap', ccCityMap);

})();