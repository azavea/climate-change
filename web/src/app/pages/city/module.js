(function () {
    'use strict';

    /** @ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('city', {
            url: '/',
            templateUrl: 'app/pages/city/city.html',
            controller: 'CityController',
            controllerAs: 'city'
        });
    }

    angular.module('cc.page.city', [
        'ui.router',
        'ui.bootstrap'
    ])
    .config(StateConfig);

})();
