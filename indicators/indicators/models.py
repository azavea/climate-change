from collections import namedtuple

# commented out models produce errors
CLIMATE_MODELS = [
    'CCSM4',
    'CESM1-BGC',
    #  'CanESM2',
    # 'GFDL-CM3',
    'GFDL-ESM2G',
    'GFDL-ESM2M',
    #  'MIROC-ESM-CHEM',
    #  'MIROC-ESM',
    #  'MIROC5',
    'MPI-ESM-LR',
    'MPI-ESM-MR',
]

YEARS = [2010, 2050, 2099]


class ModelVariable(object):
    """ Enum class for the possible model variable keys """

    TMAX = 'tasmax'
    TMIN = 'tasmin'
    PRECIP = 'pr'

    CHOICES = (TMAX, TMIN, PRECIP,)


class RCP(object):
    RCP_45 = 'rcp45'
    RCP_85 = 'rcp85'

    CHOICES = (RCP_45, RCP_85,)


Indicator = namedtuple('Indicator', ['name', 'variables'])
INDICATORS = [
    Indicator('monthly_total_precip', [ModelVariable.PRECIP]),
    Indicator('monthly_average_max_temp', [ModelVariable.TMAX]),
    Indicator('monthly_average_min_temp', [ModelVariable.TMIN]),
    Indicator('monthly_max_temp', [ModelVariable.TMAX]),
    Indicator('monthly_min_temp', [ModelVariable.TMIN]),
    Indicator('monthly_frost_days', [ModelVariable.TMIN]),
    Indicator('yearly_frost_days', [ModelVariable.TMIN]),
    Indicator('yearly_consecutive_dry_days', [ModelVariable.PRECIP]),
    Indicator('yearly_dry_periods', [ModelVariable.PRECIP]),
    Indicator('yearly_growing_degree_days', [ModelVariable.TMAX, ModelVariable.TMIN]),
]
