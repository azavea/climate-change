(function () {
    'use strict';

    /** @ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('city', {
            url: '/city/:cityId',
            templateUrl: 'app/pages/city/city.html',
            controller: 'CityPageController',
            controllerAs: 'cpc'
        });
    }

    angular.module('cc.page.city', [
        'ui.router',
        'cc.api',
        'cc.geolocation',
        'cc.city.charts',
        'cc.city.map',
        'cc.city.ourdata',
        'cc.city.switcher',
        'cc.social.tweet'
    ])
    .config(StateConfig);

})();
