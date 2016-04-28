(function () {
    'use strict';

    var OurDataConfig = [{
        title: 'Infrastructure Planning',
        image: '/assets/images/industry-infrastructure.jpg',
        description: 'Communities can plan now to adapt to changing heat wave and flood event patterns. From stormwater infrastructure to power grid resiliency, understanding the potential for change now will ensure your community\'s infrastructure is prepared.'
    }, {
        title: 'Agriculture',
        image: '/assets/images/industry-agriculture.jpg',
        description: 'Developing locations for long-to-harvest crops like orchards and vineyards relies on a solid understanding of weather patterns. The longevity of these investments depends on planning now for the future climate.'
    }, {
        title: 'Real Estate',
        image: '/assets/images/industry-realestate.jpg',
        description: 'Real estate investments made now will be subject to variations in weather patterns over time. By knowing this information up front, home buyers and land developers will make better decisions on where to buy or build.'
    }, {
        title: 'Academic Research',
        image: '/assets/images/industry-academic.jpg',
        description: 'As a society, we are still learning how climate change will affect us. Faster access to climate-related metrics will advance research and help educate public and private sector institutions about the risks, impacts, and adaptation strategies.'
    }];


    angular.module('cc.city.ourdata')
    .constant('OurDataConfig', OurDataConfig);

})();
