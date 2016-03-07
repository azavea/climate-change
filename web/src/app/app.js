(function() {
  'use strict';

  /** @ngInject */
  function run() {
  }

  /** @ngInject */
  function LogConfig($logProvider) {
    // Enable log
    $logProvider.debugEnabled(true);
  }

  /** @ngInject */
  function ChartConfig() {
    //Chart.defaults.global.responsive = true;
  }

  /** @ngInject */
  function RouterConfig($urlRouterProvider) {
    $urlRouterProvider.otherwise('/city/nearest');
  }

  angular
    .module('cc', [
        // globally enable a few optional things here so we don't have to enable them
        // in every child modules
        'ngAnimate',
        'ngAria',
        'ngTouch',
        // start app modules
        'cc.page.city'
    ])
    .config(LogConfig)
    .config(RouterConfig)
    .config(ChartConfig)
    .run(run);

})();
