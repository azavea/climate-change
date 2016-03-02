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
  function RouterConfig($urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
  }

  angular
    .module('cc', ['cc.page.city'])
    .config(LogConfig)
    .config(RouterConfig)
    .run(run);

})();
