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
                return '#E1354F';
            } else if (yearInt >= 2045) {
                return '#FE6C23';
            } else if (yearInt >= 2000) {
                return '#1A9DEC';
            } else {
                return '#666';
            }
        }
    }

    angular.module('cc.utils')
    .service('Color', Color);

})();
