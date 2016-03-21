(function () {
    'use strict';

    /* Provides conversion functions between units.
     * Usage:
     *   Units.converter(type, from, to)
     * Returns a function if one is defined for the given parameters, otherwise returns undefined.
     */

    /** @ngInject */
    function Units() {
        var conversions = {
            temp: {
                'K': {
                    'C': kToC,
                    'F': kToF,
                },
                'C': {
                    'F': cToF,
                }
            },
            precip: {
                kgPerSquareMeterPerSecond: {
                    inchesPerMonth: kgM2SecToInMo,
                },
                kgPerSquareMeterPerMonth: {
                    inchesPerMonth: kgM2ToIn,
                },
            }
        };

        var module = {
            conversions: conversions,
            converter: converter
        };
        return module;

        // Looks up and returns a unit conversion function, but returns undefined if
        // there isn't one defined for the given parameters.
        function converter(unitType, fromUnit, toUnit) {
            try {
                return conversions[unitType][fromUnit][toUnit];
            }
            catch(err) {
                if (err.name === 'TypeError') {
                    return;
                } else {
                    throw err;
                }
            }
        }

        function kToF(value) {
            return cToF(kToC(value));
        }

        function kToC(value) {
            return value - 273.15;
        }

        function cToF(value) {
            return value * 9 / 5 + 32;
        }

        // kg / m^2 / second to inches per month.
        function kgM2SecToInMo(value) {
            var secondsPerMonth = (365.25 * 24 * 60 * 60) / 12;
            return kgM2ToIn(value) * secondsPerMonth;
        }

        // 1 kilogram of water over a square meter is 1mm thick.
        function kgM2ToIn(value) {
            var inchesPerMillimeter = 1 / 25.4;
            return value * inchesPerMillimeter;
        }
    }

    angular.module('cc.utils')
    .service('Units', Units);

})();