(function () {
    'use strict';

    /** @ngInject */
    function tweetButton($state) {

        var tweetStartText = 'Our climate is changing. How will it feel in ';

        var module = {
            restrict: 'EA',
            templateUrl: 'app/components/social/tweet-button.html',
            scope: {
                cityName: '=',
                cityId: '='
            },
            link: link
        };
        return module;

        function link(scope, element, attr) {
            var tweetText = tweetStartText + scope.cityName + '?';
            var tweetUrl = $state.href('city', { cityId: scope.cityId }, {absolute: true});

            // asynchronously load twitter widget script
            // https://dev.twitter.com/web/javascript/loading
            if (!window.twttr) {
                window.twttr=(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};if(d.getElementById(id))return;js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);t._e=[];t.ready=function(f){t._e.push(f);};return t;}(document,"script","twitter-wjs"));
            }

            window.twttr.ready(function(twttr) {
                // Create button once script loaded.
                // https://dev.twitter.com/web/tweet-button/javascript-create
                twttr.widgets.createShareButton(
                    tweetUrl,
                    // first child element; same as: document.getElementById('tweet-button')
                    element.children()[0],
                    {text: tweetText, size: 'large'}
                );
            });

        }
    }

    angular.module('cc.social.tweet')
    .directive('tweetButton', tweetButton);

})();
