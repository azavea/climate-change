(function () {
    'use strict';

    /** @ngInject */
    function City($http, $q, CityList, FeelsLikeStub, strFormat) {

        var INDICATOR_URL_TEMPLATE = 'https://s3.amazonaws.com/nex-climate-indicators/{0}--{1}.json';

        var module = {
            indicators: indicators,
            feelslike: feelslike,
            list: list,
            nearest: nearest
        };
        return module;

        function indicators(city, admin) {
            var url = strFormat(INDICATOR_URL_TEMPLATE,
                                [city.replace(/ /g, '-'), admin.replace(/ /g, '-')]);
            return $http.get(url, { cache: true }).then(function (response) {
                return response.data;
            });
        }

        function feelslike(city, admin) {
            return $q.resolve(FeelsLikeStub);
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
