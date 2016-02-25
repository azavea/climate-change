import json
import os
import unittest

from indicators import *

TEST_DATA_DIR = os.path.join('test', 'data')
CLIMATE_MODEL = 'CESM1-BGC'
YEAR = 2099


class IndicatorTestCase(unittest.TestCase):

    def load_json(self, filename):
        with open(os.path.join(TEST_DATA_DIR, filename), 'r') as f:
            data = json.load(f)
        return data

    def test_monthly_total_precip(self):
        data = self.load_json('pr.json')
        i = [indicator for indicator in monthly_total_precip(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 12)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "monthly_total_precip")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 0.0013917749294449777)

    def test_monthly_average_max_temp(self):

        data = self.load_json('tasmax.json')
        i = [indicator for indicator in monthly_average_max_temp(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 12)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "monthly_average_max_temp")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 284.0791960685484)

    def test_monthly_average_min_temp(self):

        data = self.load_json('tasmin.json')
        i = [indicator for indicator in monthly_average_min_temp(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 12)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "monthly_average_min_temp")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 273.13610938287553)

    def test_monthly_max_temp(self):

        data = self.load_json('tasmax.json')
        i = [indicator for indicator in monthly_max_temp(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 12)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "monthly_max_temp")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 292.5888671875)

    def test_monthly_min_temp(self):

        data = self.load_json('tasmin.json')
        i = [indicator for indicator in monthly_min_temp(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 12)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "monthly_min_temp")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 263.15557861328125)

    def test_monthly_frost_days(self):

        data = self.load_json('tasmin.json')
        i = [indicator for indicator in monthly_frost_days(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 12)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "monthly_frost_days")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 13)

    def test_yearly_frost_days(self):

        data = self.load_json('tasmin.json')
        i = [indicator for indicator in yearly_frost_days(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 1)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "yearly_frost_days")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 62)

    def test_yearly_consecutive_dry_days(self):

        data = self.load_json('pr.json')
        i = [indicator for indicator in yearly_consecutive_dry_days(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 1)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "yearly_consecutive_dry_days")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 23)

    def test_yearly_dry_periods(self):

        data = self.load_json('pr.json')
        i = [indicator for indicator in yearly_dry_periods(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 1)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "yearly_dry_periods")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 6)

    def test_yearly_growing_degree_days(self):

        data = self.load_json('tascombined.json')
        i = [indicator for indicator in yearly_growing_degree_days(data, YEAR, CLIMATE_MODEL)]
        self.assertEqual(len(i), 1)
        i_january = i[0]
        self.assertEqual(len(i_january), 5)
        self.assertEqual(i_january[0], "yearly_growing_degree_days")
        self.assertEqual(i_january[1], "Philadelphia, United States of America")
        self.assertEqual(i_january[2], YEAR)
        self.assertEqual(i_january[3], 1)
        self.assertEqual(i_january[4], 2231.07296752929)


if __name__ == "__main__":
    unittest.main()
