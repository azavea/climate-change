(function () {
    'use strict';

    /** @ngInject */
    function ccCityMap($log, Color, WorldBorders) {
        var svg, defs;
        var width, height;
        var scale = 500;
        var projection;
        var graticule;
        var $element;

        // Domain and range multipliers to use for scaling the map to the height and width
        // of the view. Increasing domain value (x or y difference in pixels) maps to decreasing
        // range (scale factor for the map).
        var DOMAIN_MAX_FACTOR = 1.5;
        var RANGE_MIN_FACTOR = 3;
        var RANGE_MAX_FACTOR = 0.4;

        var module = {
            restrict: 'EA',
            templateUrl: 'app/components/city/map/city-map.html',
            scope: {
                city: '=',
                feelsLike: '='
            },
            link: link
        };
        return module;

        function link(scope, element, attrs) {
            svg = d3.select('.city-map svg');
            $element = element;

            graticule = d3.geo.graticule();

            // Debounce to avoid flashing a different map before the feelsLike shows up
            scope.$watchGroup(['city', 'feelsLike'], drawGlobe);

            function drawGlobe() {
                var city = scope.city;
                var feelslike = scope.feelsLike;
                var features = [];

                if (!(city && feelslike)) { return; }

                width = $element.find('svg').width();
                height = $element.find('svg').height();

                svg.selectAll("path.basemap").remove();
                svg.selectAll("path.overlay").remove();

                projection = d3.geo.orthographic()
                  .translate([width / 2, height / 2])
                  .scale(scale)
                  .clipAngle(90)
                  .precision(0.6);

                // Generate some additional derived data
                city.properties.feelsLikeYear = 2010;
                features = [city].concat(_(feelslike)
                  .toPairs()
                  .sortBy(function (v) { return v[0]; })
                  .map(function (v) {
                    v[1].properties.feelsLikeYear = v[0];
                    return v[1];
                  })
                  .value());
                var mapCenter = turf.center(turf.featurecollection(features));
                var mapExtent = turf.extent(turf.featurecollection(features));

                centerAndZoom(mapCenter.geometry.coordinates, mapExtent);

                var path = d3.geo.path().projection(projection).pointRadius(3);
                // Use a different path for feelsLike so we can keep the pointRadius constant
                var feelsLikePath = d3.geo.path().projection(projection).pointRadius(5);

                svg.append("path")
                  .datum(graticule)
                  .attr("class", "basemap graticule")
                  .attr("d", path);

                svg.append("path")
                  .datum(topojson.feature(WorldBorders, WorldBorders.objects.land))
                  .attr("class", "basemap land")
                  .attr("d", path);

                svg.append("path")
                  .datum(topojson.mesh(WorldBorders, WorldBorders.objects.countries, function(a, b) { return a !== b; }))
                  .attr("class", "basemap boundary")
                  .attr("d", path);

                // Initialize tooltips
                var tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function(d){
                        return d.properties.name;
                    });
                svg.call(tip);

                svg.selectAll(".feelslike-dot")
                    .data(features)
                  .enter().append("path")
                    .attr("class", "overlay feelslike-dot")
                    .attr("d", feelsLikePath)
                    .attr("style", function (d) {
                      return 'fill: ' + Color.forYear(d.properties.feelsLikeYear);
                    })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);

                for (var i = 0; i < features.length - 1; i++) {
                    var a = features[i];
                    var b = features[i+1];

                    var interpolator = d3.geo.interpolate(a.geometry.coordinates[0], b.geometry.coordinates[0]);
                    var linestring = {
                      "type": "LineString",
                      "coordinates": [interpolator(0.2), interpolator(0.8)]
                    };
                    svg.append("path")
                      .datum(linestring)
                      .attr("class", "overlay feelslike")
                      .attr("d", feelsLikePath)
                      .attr("marker-end", "url(#arrowhead)");
                }

                // var textWidth = width / 3;
                // svg.append("rect")
                //   .attr("class", "text-box")
                //   .attr("width", textWidth)
                //   .attr("height", height)
                //   .attr("x", 0)
                //   .attr("y", 0);
            }
        }

        /* Sets the map center to the given coordinates, and if extent is set, zooms to
         * fit the extent.
         *
         * @param {Array} center  coordinates to center the map view on
         * @param {Array} [extent]  bounding box as [west, south, east, north] to zoom to
         */
        function centerAndZoom(center, extent) {
            if (!projection) { return; }

            var gamma = 23.5;
            var rotation = _.map(center, function (v) { return v * -1; });
            rotation.push(gamma);
            projection.rotate(rotation);

            if (extent) {
                // zoom to extent. The basic idea is to figure out how big the extent is
                // in X and Y as projected and scale based on the bigger one, but the actual
                // factors used in the scalers were arrived at by trial and error.
                var lowerLeft = projection([extent[0], extent[1]]);
                var topRight = projection([extent[2], extent[3]]);
                var domainMax = DOMAIN_MAX_FACTOR * projection.scale();
                var xScale = d3.scale.linear().clamp(true)
                  .domain([0, domainMax]).range([RANGE_MIN_FACTOR * width, RANGE_MAX_FACTOR * width]);
                var yScale = d3.scale.linear().clamp(true)
                  .domain([0, domainMax]).range([RANGE_MIN_FACTOR * height, RANGE_MAX_FACTOR * height]);
                var xDiff = Math.abs(topRight[0] - lowerLeft[0]);
                var yDiff = Math.abs(topRight[1] - lowerLeft[1]);
                var scaleFactor = Math.round(Math.min(xScale(xDiff), yScale(yDiff)));
                projection.scale(scaleFactor);
            }
        }
    }

    angular.module('cc.city.map')
    .directive('ccCityMap', ccCityMap);

})();
