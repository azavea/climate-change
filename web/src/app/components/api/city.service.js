(function () {
    'use strict';

    /** @ngInject */
    function City($http, CityList) {

        var module = {
            get: get,
            list: list,
            nearest: nearest
        };
        return module;

        function get() {

        }

        function list() {
            return CityList;
        }

        function nearest(point) {
            return turf.nearest(point, list());
        }
    }

    angular.module('cc.api')
    .service('City', City);

})();