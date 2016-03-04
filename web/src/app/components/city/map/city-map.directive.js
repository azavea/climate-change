(function () {
    'use strict';

    /** @ngInject */
    function ccCityMap(WorldBorders) {
        var svg;
        var width, height;
        var scale = 1000;
        var gamma = 23.5;
        var numberFormatter = d3.format(',.0f');
        var graticule, radius;

        var module = {
            restrict: 'EA',
            template: '',
            scope: {
                cities: '=',
                center: '=',
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

            graticule = d3.geo.graticule();

            var fill = svg.append("circle")
              .attr("cx", width / 2)
              .attr("cy", height / 2)
              .attr("r", width)
              .style("fill", "#223537");

            radius = d3.scale.sqrt()
              .domain([0, 1e8])
              .range([0, 50]);

            scope.$watchGroup(['cities', 'center'], drawGlobe);
        }

        function drawGlobe(data) {
            var cities = data[0];
            var center = data[1];

            if (!(cities && center)) { return; }

            svg.selectAll("path").remove();
            var rotation = _.map(center.geometry.coordinates, function (v) { return v * -1; });
            rotation.push(gamma);

            var projection = d3.geo.orthographic()
              .translate([width / 2, height / 2])
              .scale(scale)
              .rotate(rotation)
              .clipAngle(90)
              .precision(0.6);

            var path = d3.geo.path()
              .projection(projection);

            svg.append("path")
              .datum(graticule)
              .attr("class", "graticule")
              .attr("d", path);

            svg.append("path")
              .datum(topojson.feature(WorldBorders, WorldBorders.objects.land))
              .attr("class", "land")
              .attr("d", path);

            svg.append("path")
              .datum(topojson.mesh(WorldBorders, WorldBorders.objects.countries, function(a, b) { return a !== b; }))
              .attr("class", "boundary")
              .attr("d", path);

            if (!cities) { return; }

            svg.selectAll(".symbol")
                .data(cities.features.sort(function(a, b) { return b.properties.pop2010 - a.properties.pop2010; }))
              .enter().append("path")
                .attr("class", "symbol")
                .attr("d", path.pointRadius(function(d) { return radius(d.properties.pop2010 * 1000); }))
              .append("title")
                .text(function(d) {
                  return d.properties.nameascii + "\nPopulation 2010: " + (numberFormatter(d.properties.pop2010 * 1000));
                });
        }
    }

    angular.module('cc.city.map')
    .directive('ccCityMap', ccCityMap);

})();
