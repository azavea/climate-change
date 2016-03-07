(function () {
    'use strict';

    /** @ngInject */
    function strFormat() {
        return function (str, args) {
            for (var i = 0; i < args.length; i++) {
                var replacement = '{' + i + '}';
                str = str.replace(replacement, args[i]);
            }
            return str;
        };
    }

    angular.module('cc.utils')
    .service('strFormat', strFormat);

})();