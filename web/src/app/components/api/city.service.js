(function () {
    'use strict';

    /** @ngInject */
    function City($http, $q, CityList, FeelsLikeStub, strFormat) {

        var INDICATOR_URL_TEMPLATE = 'https://s3.amazonaws.com/climate-projection-data/nex-climate-indicators/{0}--{1}.json';
        var FUTURE_CITY_URL_TEMPLATE = 'https://s3.amazonaws.com/climate-projection-data/feels-like-city-projections/rcp85/{0}--{1}.json';

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
            // UI only accepts 1 scenario, default to rcp85
            var rcp85_url = strFormat(FUTURE_CITY_URL_TEMPLATE,
                                [city.replace(/\s+/g, '-'), admin.replace(/\s+/g, '-')]);
            return $http.get(rcp85_url).then(function (response) {
                return response.data;
            });
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
