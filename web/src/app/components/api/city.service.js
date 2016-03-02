(function () {
    'use strict';

    /** @ngInject */
    function City($http, CityList) {

        var module = {
            get: get,
            list: list
        };
        return module;

        function get() {

        }

        function list() {
            return CityList;
        }
    }

    angular.module('cc.api')
    .service('City', City);

})();