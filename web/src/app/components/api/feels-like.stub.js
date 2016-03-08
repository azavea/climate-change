(function () {
    'use strict';

    var FeelsLikeStub = {
        2050: {
            type: "Feature",
            properties: {
                name: 'Charlotte',
                admin: 'United States of America',
                adm0_a3: 'USA'
            },
            geometry: {
                type: 'Point',
                coordinates: [-84.401895, 33.83196]
            }
        },
        2099: {
            type: "Feature",
            properties: {
                name: 'Miami',
                admin: 'United States of America',
                adm0_a3: 'USA'
            },
            geometry: {
                type: 'Point',
                coordinates: [-80.226052, 25.789557]
            }
        }
    };

    angular.module('cc.api')
    .constant('FeelsLikeStub', FeelsLikeStub);

})();
