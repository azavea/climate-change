/* global malarkey:false, moment:false */
(function() {
  'use strict';

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

  /** @ngInject */
  function config($logProvider, toastrConfig) {
    // Enable log
    $logProvider.debugEnabled(true);

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;
  }

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      });

    $urlRouterProvider.otherwise('/');
  }

  angular
    .module('cc', ['ngTouch', 'ngAria', 'ui.router', 'toastr'])
    .config(config)
    .config(routerConfig)
    .constant('malarkey', malarkey)
    .constant('moment', moment)
    .run(runBlock);

})();
