(function () {
    'use strict';

    /** @ngInject */
    function Units() {
        var module = {
            kToF: kToF,
            kToC: kToC,
            cToF: cToF
        };
        return module;

        function kToF(value) {
            return cToF(kToC(value));
        }

        function kToC(value) {
            return value - 273.15;
        }

        function cToF(value) {
            return value * 9 / 5 + 32;
        }
    }

    angular.module('cc.utils')
    .service('Units', Units);

})();