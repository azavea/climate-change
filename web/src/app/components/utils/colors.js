(function () {
    'use strict';

    /** @ngInject */
    function Color() {
        var secretDiv = angular.element('<div></div>').hide().appendTo('body');

        var module = {
            forYear: forYear
        };
        return module;

        function forYear(year) {
            var yearInt = parseInt(year, 10);
            var color = '#666';
            if (yearInt >= 2095) {
                color = secretDiv.attr('class', 'color-tertiary').css('color');
            } else if (yearInt >= 2045) {
                color = secretDiv.attr('class', 'color-secondary').css('color');
            } else if (yearInt >= 2000) {
                color = secretDiv.attr('class', 'color-primary').css('color');
            }
            return color;
        }
    }

    angular.module('cc.utils')
    .service('Color', Color);

})();
