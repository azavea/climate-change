(function () {
    'use strict';

    /** @ngInject */
    function YearlyIndicatorController($scope) {
        var vm = this;
        initialize();

        function initialize() {
            if (!vm.scenario) {
                throw 'Chart requires the "scenario" attribute';
            }
            if (!vm.indicator) {
                throw 'Chart requires the "indicator" attribute';
            }
            if (!vm.label) {
                throw 'Chart requires the "label" attribute';
            }

            $scope.$watch(function () { return vm.data; }, setValues);
        }

        function setValues(data) {
            if (!data) {
                return;
            }
            var indicators = data[vm.scenario];
            if (indicators && indicators.yearly_frost_days) {
                vm.values = _.map(indicators[vm.indicator], function (obj, year) {
                    return [year, _.values(obj)[0]];
                });
            }
        }
    }

    /** @ngInject */
    function ccYearlyIndicator() {
        var module = {
            restrict: 'EA',
            templateUrl: 'app/components/city/charts/city-card-yearly-indicator.html',
            scope: {
                data: '=',
                scenario: '@',
                indicator: '@',
                label: '@'
            },
            controller: 'YearlyIndicatorController',
            controllerAs: 'yic',
            bindToController: true
        };
        return module;
    }

    angular.module('cc.city.charts')
    .controller('YearlyIndicatorController', YearlyIndicatorController)
    .directive('ccYearlyIndicator', ccYearlyIndicator);

})();