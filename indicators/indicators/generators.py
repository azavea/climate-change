""" Generators used to loop the nex2json .nc.json files

TODO: Refactor generators so the yield_monthly_data and yield_yearly_data generators
      allow for multiple variable inputs, rather than having a separate generator

"""
import calendar

from models import ModelVariable


def yield_monthly_data(data, year, variable, model, default_value=None):
    """ Generator to provide model values for each city for each month

    Bad data cleaned to default_value

    Yields a tuple of ("city", month, data) where data is a list of values for the requested
    year, month, variable, model

    """
    if variable not in ModelVariable.CHOICES:
        raise TypeError('variable must be one of ModelVariable.CHOICES')

    for city in data:
        data_key = '{}_{}'.format(variable, model)
        values = data[city].get(data_key, None)
        if values is None:
            raise ValueError('No data found for key {}'.format(data_key))
        for m in range(1, 13):
            _, days = calendar.monthrange(year, m)
            result = []
            for d in range(1, days + 1):
                key = "{:04d}{:02d}{:02d}".format(year, m, d)
                result.append(values.get(key, default_value))
            yield (city, m, result)


def yield_yearly_data(data, year, variable, model, default_value=None):
    """ Generator to provide model values for each city for the entire requested year

    Bad data cleaned to default_value

    Yields a tuple of ("city", data) where data is a list of values for the requested
    year, variable, model

    """

    if variable not in ModelVariable.CHOICES:
        raise TypeError('variable must be one of ModelVariable.CHOICES')

    for city in data:
        data_key = '{}_{}'.format(variable, model)
        values = data[city].get(data_key, None)
        if values is None:
            raise ValueError('No data found for key {}'.format(data_key))
        result = []
        for m in range(1, 13):
            _, days = calendar.monthrange(year, m)
            for d in range(1, days + 1):
                key = "{:04d}{:02d}{:02d}".format(year, m, d)
                result.append(values.get(key, default_value))
        yield (city, result)


def yield_multivariable_yearly_data(data, year, variables, model, default_value=None):
    """ Generator to provide model values for multiple variables

    Returns a tuple of ("city", data) where data is a list of tuples of the requested
    variable values

    """
    if not variables <= ModelVariable.CHOICES:
        raise TypeError('variables must in ModelVariable.CHOICES')

    for city in data:
        data_keys = ['{}_{}'.format(variable, model) for variable in variables]
        result = []
        for m in range(1, 13):
            _, days = calendar.monthrange(year, m)
            for d in range(1, days + 1):
                key = "{:04d}{:02d}{:02d}".format(year, m, d)
                day_data = []
                for data_key in data_keys:
                    try:
                        day_data.append(data[city][data_key][key])
                    except KeyError:
                        day_data.append(default_value)
                result.append(day_data)
        yield (city, result)
