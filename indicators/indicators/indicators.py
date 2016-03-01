""" Indicator calculation functions

Each indicator function has the inputs:

@param data dict One of the nex2json .nc.json files loaded as a dict
@param year int The specific year to pull data from the model for
@param variable ModelVariable.CHOICES
@param model String

and is a generator that yields the tuple:

("indicator_name", "city", year, month, value)

for each city in the input data

If it is a yearly indicator, then month will be set to 1

For best results, the indicator function name should match the indicator name
found in indicators.models.Indicators

"""
import sys

from generators import yield_monthly_data, yield_yearly_data, yield_multivariable_yearly_data
from models import ModelVariable



def monthly_total_precip(data, year, model):
    """ monthly_total_precip """

    for city, month, values in yield_monthly_data(data, year, ModelVariable.PRECIP, model, default_value=0.0):
        total = sum(values)
        yield ("monthly_total_precip", city, year, month, total)


def monthly_average_max_temp(data, year, model):
    """ monthly_average_max_temp """

    for city, month, values in yield_monthly_data(data, year, ModelVariable.TMAX, model, default_value=None):
        clean_values = [v for v in values if v is not None]
        avg = sum(clean_values) / len(clean_values)
        yield ("monthly_average_max_temp", city, year, month, avg)


def monthly_average_min_temp(data, year, model):
    """ monthly_average_min_temp """

    for city, month, values in yield_monthly_data(data, year, ModelVariable.TMIN, model, default_value=None):
        clean_values = [v for v in values if v is not None]
        avg = sum(clean_values) / len(clean_values)
        yield ("monthly_average_min_temp", city, year, month, avg)


def monthly_min_temp(data, year, model):
    """ monthly_min_temp

    Find the lowest low in the given month

    """

    for city, month, values in yield_monthly_data(data, year, ModelVariable.TMIN, model, default_value=sys.maxint):
        min_value = min(values)
        yield ("monthly_min_temp", city, year, month, min_value)


def monthly_max_temp(data, year, model):
    """ monthly_max_temp

    Find the highest high in the given month

    """
    for city, month, values in yield_monthly_data(data, year, ModelVariable.TMAX, model, default_value=-1):
        max_value = max(values)
        yield ("monthly_max_temp", city, year, month, max_value)


def monthly_frost_days(data, year, model):
    """ monthly_frost_days

    Find the number of days in the month in which the minimum temperature is below freezing

    """
    MELTING_POINT_WATER_K = 273.15

    for city, month, values in yield_monthly_data(data, year, ModelVariable.TMIN, model,
                                                  default_value=sys.maxint):
        num_frost_days = reduce(lambda s, v: s + 1 if v < MELTING_POINT_WATER_K else s,
                                values, 0)
        yield ("monthly_frost_days", city, year, month, num_frost_days)


def yearly_frost_days(data, year, model):
    """ yearly_frost_days

    Find the number of days in the year in which the minimum temperature is below freezing

    """
    MELTING_POINT_WATER_K = 273.15

    for city, values in yield_yearly_data(data, year, ModelVariable.TMIN, model,
                                                 default_value=sys.maxint):
        num_frost_days = reduce(lambda s, v: s + 1 if v < MELTING_POINT_WATER_K else s,
                                values, 0)
        yield ("yearly_frost_days", city, year, 1, num_frost_days)


def yearly_consecutive_dry_days(data, year, model):
    """ yearly_consecutive_dry_days

    Find the longest streak of no days of rain in the year

    """

    for city, values in yield_yearly_data(data, year, ModelVariable.PRECIP, model, default_value=0):
        consecutive_days = 0
        longest_streak = 0
        for v in values:
            if v == 0:
                consecutive_days += 1
                if consecutive_days > longest_streak:
                    longest_streak = consecutive_days
            else:
                consecutive_days = 0
        yield ("yearly_consecutive_dry_days", city, year, 1, longest_streak)


def yearly_dry_periods(data, year, model):
    """ yearly_dry_periods

    Find the number of times in a year that there are more than THRESHOLD_DAYS days in a row
    with no rain

    TODO: Peruse literature to find a sensible THRESHOLD_DAYS, use 5 for now

    """
    THRESHOLD_DAYS = 5

    for city, values in yield_yearly_data(data, year, ModelVariable.PRECIP, model, default_value=0):
        dry_periods = 0
        consecutive_days = 0
        for v in values:
            if v == 0:
                consecutive_days += 1
                if consecutive_days == THRESHOLD_DAYS:
                    dry_periods += 1
            else:
                consecutive_days = 0
        yield ("yearly_dry_periods", city, year, 1, dry_periods)


def yearly_growing_degree_days(data, year, model):
    """ yearly_growing_degree_days

    See: https://en.wikipedia.org/wiki/Growing_degree-day#GDD_calculation for implementation details

    TODO: Potentially choose a different T_BASE. 10C is a good starting point for common crops

    """
    variables = (ModelVariable.TMAX, ModelVariable.TMIN,)
    T_BASE = 283.15
    T_MAX_CAP = 303.15
    for city, values in yield_multivariable_yearly_data(data, year, variables, model, default_value=None):
        total_gdds = 0
        for t_max, t_min in values:
            if t_max is None or t_min is None:
                continue
            if t_max > T_MAX_CAP:
                t_max = T_MAX_CAP

            gdds = (t_max + t_min) / 2.0 - T_BASE
            if gdds > 0:
                total_gdds += gdds
        yield ("yearly_growing_degree_days", city, year, 1, total_gdds)
