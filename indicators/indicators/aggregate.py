from collections import OrderedDict
import json
from shutil import rmtree
from tempfile import mkdtemp
import os.path
import argparse

from models import RCP, YEARS, CLIMATE_MODELS, INDICATORS
import indicators
from nex_json import pull_s3


def average_values(values_dict):
    """
    Averages all the values of a dict
    """
    values = values_dict.values()
    return float(sum(values)) / len(values)


def aggregate_models(indicator_list=INDICATORS, years=YEARS, models=CLIMATE_MODELS,
                     data_dir=None, aggregate_func=average_values):
    """
    Takes list of Indicator tuples, years, models, and an optional aggregate function
    and calculates indicators for
    """
    temp_dir = False
    if data_dir is None:
        data_dir = mkdtemp()
        temp_dir = True
    results = OrderedDict()
    try:
        for rcp in RCP.CHOICES:
            for indicator in indicator_list:
                for variable in indicator.variables:
                    for year in years:
                        # for each year, we aggregate all the models together with an aggregation
                        # function -- `average_values`, for example
                        dataforyear = OrderedDict()
                        for model in models:
                            print(model, year, variable, rcp, indicator.name)
                            try:
                                data = pull_s3(rcp, variable, model, year, data_dir)
                                for i in getattr(indicators, indicator.name)(data, year, model):
                                    if i[:-1] not in dataforyear:
                                        dataforyear[i[:-1]] = {}
                                    dataforyear[i[:-1]][model] = i[-1]
                            except Exception as e:
                                print('exception during calculating indicator')
                                print(rcp, variable, model, year, indicator)
                                raise e
                        for k, v in dataforyear.iteritems():
                            results[(rcp,) + k] = aggregate_func(v)  # add aggreated data to results
    except Exception as e:
        raise e
    finally:
        if temp_dir:
            rmtree(data_dir)
    return results


def aggregate_into_cities(data):
    """
    Unpacks aggregated data into nested dicts
    """
    result = OrderedDict()
    for k, v in data.iteritems():
        city = k[2]
        if city not in result:
            result[city] = OrderedDict()
            result[city]['city_name'] = city  # embed city name in result
        hierarchy = k[0:2] + k[3:]  # [rcp and indicator name] + [year, month, etc]
        leaf = result[city]
        for key in hierarchy[:-1]:
            # descend down the tree so that we can insert a value at the leaf
            if key not in leaf:
                leaf[key] = OrderedDict()
            leaf = leaf[key]
        leaf[hierarchy[-1]] = v
    return result


def write_to_json(data, dir):
    """
    For each city, create a file and serialize the aggregated data as json
    """
    def sanitize_str(value):
        return ''.join(map(lambda c: '-' if c in [',', ' '] else c, value))

    for k, v in data.iteritems():
        with open(os.path.join(dir, '{}.json'.format(sanitize_str(k))), 'w') as f:
            print(k)
            json.dump(v, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description='Aggregate climate data')
    parser.add_argument('data_dir', metavar='DATADIR', type=str,
                        help='Directory with data to be used. Data will '
                             'download here if not locally available.')
    parser.add_argument('out_dir', metavar='OUTDIR', type=str,
                        help='Output directory')
    args = parser.parse_args()
    print('Calc indicators')
    avgd_values = aggregate_models(data_dir=args.data_dir)
    print('Aggrigate into cities')
    aggregated_by_city = aggregate_into_cities(avgd_values)
    print('Write json')
    write_to_json(aggregated_by_city, args.out_dir)


if __name__ == '__main__':
    main()
