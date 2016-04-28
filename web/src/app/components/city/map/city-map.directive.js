(function () {
    'use strict';

    /** @ngInject */
    function ccCityMap($log, $window, Color, CCMath, WorldBorders) {
        var svg;
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

        function link(scope, element) {
            svg = d3.select('.city-map svg');
            $element = element;

            graticule = d3.geo.graticule();

            // Debounce to avoid flashing a different map before the feelsLike shows up
            scope.$watchGroup(['city', 'feelsLike'], drawGlobe);
            $($window).on('resize', _.debounce(drawGlobe, 100));
            scope.$on('$destroy', onScopeDestroy);

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
                  .translate([width * 2 / 3, height / 2])
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
                var mapExtent = turf.extent(turf.featurecollection(features));

                setMapBounds(mapExtent);

                var path = d3.geo.path().projection(projection).pointRadius(3);

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

                drawFeelsLikeOverlay(svg, features);
            }
        }

        /**
         * Draw feels like text and pointer lines and dots into the container, using features
         */
        function drawFeelsLikeOverlay(container, features) {

            // Use a different path for feelsLike so we can keep the pointRadius constant
            var feelsLikePath = d3.geo.path().projection(projection).pointRadius(5);

            // Initialize tooltips
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d){
                    return '<div class="map-tip-header"></div>' +
                    '<div class="map-tip-body">' + d.properties.nameascii + '</div>';
                });
            svg.call(tip);

            // Bail out if we don't have exactly three features
            if (!(features && features.length === 3)) {
                return;
            }

            // Persist original 3 features for map orientation before the array is chopped up
            var originalFeatures = angular.extend({}, features);

            // Filter features for unique results, generate appropraite map message
            function makeCityLabel (features) {
                var label = [];
                var temp = [];
                label.push([{
                        text: features[0].properties.nameascii,
                        style: 'font-weight: bold; fill: ' + Color.forYear(features[0].properties.feelsLikeYear)
                    }]);
                if (features[1]) {
                    temp = [
                        { text: '... may feel like' },
                        {
                            text: features[1].properties.nameascii,
                            style: 'font-weight: bold; fill: ' + Color.forYear(features[1].properties.feelsLikeYear)
                        },
                        { text: 'in ' + features[1].properties.feelsLikeYear + ' ...' }
                    ];
                    label.push(temp);
                }
                if (features[2]) {
                    temp = [
                        { text: '... and' },
                        {
                            text: features[2].properties.nameascii,
                            style: 'font-weight: bold; fill: ' + Color.forYear(features[2].properties.feelsLikeYear)
                        },
                        { text: 'in ' + features[2].properties.feelsLikeYear + '.'} //round up for effect...
                    ];
                    label.push(temp);
                }
                return label;
            }

            var city1 = features[0].properties.cartodb_id;
            var city2 = features[1].properties.cartodb_id;
            var city3 = features[2].properties.cartodb_id;
            var cityLabelText = [];
            // If the city maintains it's climate
            if (city1 === city2 && city1 === city3) {
                features.splice(1,2);
                cityLabelText = makeCityLabel(features);
                var temp = { text: '...may feel about the same.' };
                cityLabelText[0].push(temp);
            } else {
                // Cases of 2 or 3 different projected climates
                if (city1 === city2) {
                    features.splice(1, 1);
                } else if (city2 === city3 || city1 === city3) {
                    features.splice(2, 1);
                }
                cityLabelText = makeCityLabel(features);
            }

            // Add text box with feels like text
            svg.selectAll("g.text-box").remove();
            svg.selectAll("path.feelslike-line").remove();
            svg.selectAll(".feelslike-dot").remove();
            svg.selectAll(".line-dot").remove();
            var textBox = svg.append("g")
              .attr("class", "text-box");

            var textAnchorX = $('.charts-header').position().left;
            var textAnchorY = height / 5;   // start 1/5 down the page, and increment from there...
            var yIncrement = 20;            // by this yIncrement
            var textGroupPadding = 20;
            var cityTextAnchors = [];
            var cityCoords = _.map(originalFeatures, function (f) {
                return f.geometry.type === 'Point' ?
                    f.geometry.coordinates : f.geometry.coordinates[0];
            });
            var orientation = CCMath.orient2d(cityCoords);

            _.forEach(cityLabelText, function (labelSet, i) {
                var topY = textAnchorY;
                _.forEach(labelSet, function (labelPiece) {
                    textBox.append("text")
                      .attr("class", "text-box-text")
                      .attr('x', textAnchorX)
                      .attr('y', textAnchorY)
                      .text(labelPiece.text)
                      .attr('style', labelPiece.style)
                      .style('opacity', 1);
                    textAnchorY += yIncrement;
                });

                cityTextAnchors.push([textAnchorX, Math.max(topY, textAnchorY - (2 * yIncrement))]);
                textAnchorY += textGroupPadding;
            });
            var maxTextWidth = textBox.node().getBBox().width;

            // now that we have max text width, loop em' again to draw the lines
            var line = d3.svg.line()
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; })
                .interpolate('linear');
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                var x1 = cityTextAnchors[i][0] + maxTextWidth;
                var y1 = cityTextAnchors[i][1] - textGroupPadding / 3.0;

                var coords = feature.geometry.type === 'Point' ?
                    feature.geometry.coordinates : feature.geometry.coordinates[0];
                var featureXY = projection(coords);
                var x3 = featureXY[0];
                var y3 = featureXY[1];
                var yDiff = Math.abs(y3 - y1);

                var x2 = x3 - yDiff;
                // Ensure midpoint isn't left of the left edge of line
                x2 = x1 > x2 ? x1 : x2;
                var y2 = y1;

                var lineData = [[x1, y1], [x2, y2], [x3, y3]];
                var linePath = svg.append('path')
                  .attr('d', line(lineData))
                  .attr('class', 'feelslike-line')
                  .style('opacity', 1);
            }

            // Draw feelslike dots -- last so they show on top
            var dots = svg.selectAll(".feelslike-dot")
                .data(features)
              .enter().append("path")
                .attr("class", "overlay feelslike-dot")
                .attr("d", feelsLikePath)
                .attr("style", function (d) {
                  return 'fill: ' + Color.forYear(d.properties.feelsLikeYear);
                })
                .style('opacity', 1)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);
        }

        /* Sets the map center to the given coordinates, and if extent is set, zooms to
         * fit the extent.
         *
         * @param {Array} center  coordinates to center the map view on
         * @param {Array} [extent]  bounding box as [west, south, east, north] to zoom to
         */
        function setMapBounds(extent) {
            if (!(projection && extent)) { return; }

            var gamma = 23.5;
            var lowerLeft = projection([extent[0], extent[1]]);
            var topRight = projection([extent[2], extent[3]]);

            var centerX = (extent[0] + extent[2]) / 2;
            var centerY = (extent[1] + extent[3]) / 2;
            var rotation = [centerX * -1, centerY * -1, gamma];
            projection.rotate(rotation);

            // zoom to extent. The basic idea is to figure out how big the extent is
            // in X and Y as projected and scale based on the bigger one, but the actual
            // factors used in the scalers were arrived at by trial and error.
            var domainMax = DOMAIN_MAX_FACTOR * projection.scale();
            var xScale = d3.scale.linear().clamp(true)
              .domain([0, domainMax]).range([width + RANGE_MIN_FACTOR * width, RANGE_MAX_FACTOR * width]);
            var yScale = d3.scale.linear().clamp(true)
              .domain([0, domainMax]).range([RANGE_MIN_FACTOR * height, RANGE_MAX_FACTOR * height]);
            var xDiff = Math.abs(topRight[0] - lowerLeft[0]);
            var yDiff = Math.abs(topRight[1] - lowerLeft[1]);
            var scaleFactor = Math.round(Math.min(xScale(xDiff), yScale(yDiff)));
            projection.scale(scaleFactor);
        }

        function onScopeDestroy() {
            $($window).off('resize');
        }
    }

    angular.module('cc.city.map')
    .directive('ccCityMap', ccCityMap);

})();
