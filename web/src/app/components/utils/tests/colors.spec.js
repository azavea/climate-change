(function() {
  'use strict';

  describe('Colors service', function() {
    beforeEach(module('cc.utils'));

    var Color;
    var defaultColor = null;

    beforeEach(inject(function(_Color_) {
        Color = _Color_;
    }));

    it('should be registered', function() {
      expect(Color).not.toBeNull();
    });

    it('should return a default color when given no arguments', function () {
      defaultColor = Color.forYear();
      expect(defaultColor).not.toBeNull();
    });

    it('should return a default color when given an out-of-range argument', function () {
      expect(Color.forYear(1854)).toEqual(defaultColor);
    });

    it('should return something other than the default color when given an in-range argument', function () {
      expect(Color.forYear(2010)).not.toEqual(defaultColor);
    });

    // TODO: we don't have the actual page with styles loaded in this unit test,
    // so to test against the style names disappearing we would need an end-to-end test.

  });
})();

