(function () {
    'use strict';

    /** @ngInject */
    function Color() {
        var module = {
            forYear: forYear
        };
        return module;

        function forYear(year) {
            var yearInt = parseInt(year, 10);
            if (yearInt >= 2095) {
                return '#4D096A';
            } else if (yearInt >= 2045) {
                return '#FFAD00';
            } else if (yearInt >= 2000) {
                return '#48B1EF';
            } else {
                return '#666';
            }
        }
    }

    angular.module('cc.utils')
    .service('Color', Color);

})();
