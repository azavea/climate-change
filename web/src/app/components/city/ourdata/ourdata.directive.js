(function () {
    'use strict';

    /** @ngInject */
    function OurDataController(OurDataConfig) {
        var vm = this;
        initialize();

        function initialize() {
            vm.data = _.chunk(OurDataConfig, 2);
        }
    }

    /** @ngInject */
    function ccOurData() {
        var module = {
            restrict: 'EA',
            templateUrl: 'app/components/city/ourdata/ourdata.html',
            scope: {
                config: '='
            },
            controller: 'OurDataController',
            controllerAs: 'odc',
            bindToController: true
        };
        return module;
    }

    angular.module('cc.city.ourdata')
    .controller('OurDataController', OurDataController)
    .directive('ccOurData', ccOurData);

})();
