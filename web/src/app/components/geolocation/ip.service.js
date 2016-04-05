(function () {
    'use strict';

    /** @ngInject */
    function IPGeolocation($http) {
        var module = {
            get: get
        };
        return module;

        function get() {
            return $http.get('https://whereami.azavea.com').then(function (response) {
                if (response.data && response.data.results && response.data.results.location) {
                    var location = response.data.results.location;
                    return turf.point([location.lon, location.lat]);
                } else {
                    throw new Error('No location from whereami.azavea.com');
                }
            });
        }
    }

    angular.module('cc.geolocation')
    .service('IPGeolocation', IPGeolocation);

})();
