(function () {
    'use strict';

    /** @ngInject */
    function CCMath() {
        var module = {
            orient2d: orient2d
        };
        return module;

        /**
         * Determine orientation of a line of three points
         *
         * a,b,c are each arrays of two numbers
         * OR
         * a can be an array of three points
         *
         * Taken from:
         * https://www.cs.cmu.edu/~quake/robust.html
         *
         * @return {Number} Positive if line turns counterclockwise, negative if clockwise,
         *                  zero if collinear
         */
        function orient2d(a, b, c) {
            if (_.isArray(a) && a.length === 3 && _.isArray(a[0])) {
                var data = a;
                c = a[2];
                b = a[1];
                a = a[0];
            }
            var acx = a[0] - c[0];
            var bcx = b[0] - c[0];
            var acy = a[1] - c[1];
            var bcy = b[1] - c[1];
            return acx * bcy - acy * bcx;
        }
    }

    angular.module('cc.utils')
    .service('CCMath', CCMath);

})();