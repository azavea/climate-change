(function() {
  'use strict';

  describe('constant CityList', function() {
    var CityList;

    beforeEach(module('cc.api'));
    beforeEach(inject(function(_CityList_) {
        CityList = _CityList_;
    }));

    it('should be registered', function() {
      expect(CityList).not.toEqual(null);
    });

    it('should be geojson', function() {
      expect(CityList.type).toEqual("FeatureCollection");
      expect(CityList.features).toEqual(jasmine.any(Array));
    });

    it('should have 590 cities', function () {
      expect(CityList.features.length).toEqual(590);
    });
  });
})();