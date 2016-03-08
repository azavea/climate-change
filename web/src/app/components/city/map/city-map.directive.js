(function () {
    'use strict';

    /** @ngInject */
    function ccCityMap($log, Color, WorldBorders) {
        var svg, defs;
        var arrowhead;
        var width, height;
        var scale = 500;
        var gamma = 23.5;
        var projection, graticule;

        var module = {
            restrict: 'EA',
            template: '',
            scope: {
                cities: '=',
                center: '=',
                feelsLike: '=',
                width: '=',
                height: '='
            },
            link: link
        };
        return module;

        function link(scope, element, attrs) {
            width = parseInt(attrs.width, 10) || element.width();
            height = parseInt(attrs.height, 10) || element.height();
            svg = d3.select(element[0]).append('svg')
              .attr('width', width)
              .attr('height', height);
            element.css({ width: width, height: height });

            defs = svg.append("defs");
            arrowhead = defs.append("marker")
              .attr({
                "id": "arrowhead",
                "viewBox": "0 -5 10 10",
                "refX": 5,
                "refY": 0,
                "markerWidth": 4,
                "markerHeight": 4,
                "orient": "auto"
              })
              .append("path")
                .attr("d", "M 0 -5 L 10 0 L 0 5")
                .attr("class", "arrowhead");

            graticule = d3.geo.graticule();

            var fill = svg.append("circle")
              .attr("cx", width / 2)
              .attr("cy", height / 2)
              .attr("r", width);

            projection = d3.geo.orthographic()
              .translate([width / 2, height / 2])
              .scale(scale)
              .clipAngle(90)
              .precision(0.6);

            scope.$watchGroup(['cities', 'center', 'feelsLike'], drawGlobe);
        }

        function drawGlobe(data) {
            var cities = data[0];
            var center = data[1];
            var feelslike = data[2];

            if (!center) { return; }

            svg.selectAll("path.basemap").remove();
            svg.selectAll("path.overlay").remove();

            var rotation = _.map(center.geometry.coordinates, function (v) { return v * -1; });
            rotation.push(gamma);

            setCenter(center.geometry.coordinates);

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

            if (cities) {
              svg.selectAll(".symbol")
                  .data(cities.features)
                .enter().append("path")
                  .attr("class", "overlay symbol")
                  .attr("d", path);
            }

            if (feelslike) {
                center.properties.feelsLikeYear = 2010;
                var features = [center].concat(_(feelslike)
                  .toPairs()
                  .sortBy(function (v) { return v[0]; })
                  .map(function (v) {
                    v[1].properties.feelsLikeYear = v[0];
                    return v[1];
                  })
                  .value());
                svg.selectAll(".feelslike-dot")
                    .data(features)
                  .enter().append("path")
                    .attr("class", "overlay feelslike-dot")
                    .attr("d", feelsLikePath)
                    .attr("style", function (d) {
                      return 'fill: ' + Color.forYear(d.properties.feelsLikeYear);
                    });

                for (var i = 0; i < features.length - 1; i++) {
                    var a = features[i];
                    var b = features[i+1];

                    var interpolator = d3.geo.interpolate(a.geometry.coordinates, b.geometry.coordinates);
                    var linestring = {
                      "type": "LineString",
                      "coordinates": [interpolator(0.1), interpolator(0.85)]
                    };
                    svg.append("path")
                      .datum(linestring)
                      .attr("class", "overlay feelslike")
                      .attr("d", feelsLikePath)
                      .attr("marker-end", "url(#arrowhead)");
                }
            }
        }

        function setCenter(center) {
            if (!projection) { return; }

            var rotation = _.map(center, function (v) { return v * -1; });
            rotation.push(gamma);
            projection.rotate(rotation);
        }
    }

    angular.module('cc.city.map')
    .directive('ccCityMap', ccCityMap);

})();
