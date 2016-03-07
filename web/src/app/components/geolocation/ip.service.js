(function () {
    'use strict';

    /** @ngInject */
    function IPGeolocation($q) {
        var module = {
            get: get
        };
        return module;

        function get() {
            var dfd = $q.defer();
            var nearPhilly = [-75.245012, 39.979495];
            dfd.resolve(turf.point(nearPhilly));
            return dfd.promise;
        }
    }

    angular.module('cc.geolocation')
    .service('IPGeolocation', IPGeolocation);

})();