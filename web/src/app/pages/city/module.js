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
        'cc.city.switcher'
    ])
    .config(StateConfig);

})();
