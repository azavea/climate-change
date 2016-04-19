"""""""""""""""""""""""""""""""""""""""""
DOEE - Climate Change

Script for creating and formatting a
separate JSON file for each study city

Azavea Inc, 2016
"""""""""""""""""""""""""""""""""""""""""

import argparse
import logging
import geojson
import json
import glob
import os
from collections import defaultdict
from sklearn import preprocessing, decomposition
from sklearn.metrics.pairwise import euclidean_distances
import numpy as numpy
import pylab as pl

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

years = ["2050", "2099"]
months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
rcps = ['rcp45', 'rcp85']


def make_rcp_path(rcp):
    """Creates path strings for RCP scenario"""
    return os.path.join('data', 'feelslike', rcp)


def create_scaler(cities, all_futures, year):
    """Returns 2D array of selected variables per city for later statistics analysis"""
    master_array = list()
    for city in cities:
        tempArray = []
        city_name = city["properties"]["name"]
        for month in months:
            tempArray.append(all_futures[city_name]["monthly_total_precip"][year][month])
        for month in months:
            tempArray.append(all_futures[city_name]["monthly_average_max_temp"][year][month])
        for month in months:
            tempArray.append(all_futures[city_name]["monthly_average_min_temp"][year][month])
        for month in months:
            tempArray.append(all_futures[city_name]["monthly_max_temp"][year][month])
        for month in months:
            tempArray.append(all_futures[city_name]["monthly_min_temp"][year][month])
        for month in months:
            tempArray.append(all_futures[city_name]["monthly_frost_days"][year][month])
        master_array.append(tempArray)
    X = numpy.array(master_array)
    return X


def compare_cities(cities, all_futures, scales, rcp_dir_path):
    """ For 1 RCP scenarios, performs:
    1. Data standardization and normalization to 2010 data;
    2. PCA -- variable reduction analysis;
    3. Euclidean Distance of PCA results to get feelslike cities
    4. Writes out files
    """
    logger.info('Comparing cities now')
    pca_results = []
    base = preprocessing.StandardScaler().fit(scales[0])
    pca = decomposition.PCA(n_components=.99).fit(base.transform(scales[0]))  # PCA for 99% of variance
    for scale in scales:
        X = base.transform(scale)
        Y = pca.transform(X)
        pca_results.append(Y)
    pca_2010 = pca_results.pop(0)
    total = pca_2010.shape[0]

    ## Uncomment for interactive scattergraph of PCA output--->
    # pl.scatter(pca_2010[:, 0], pca_2010[:, 1])
    # for i in range(total):
    #   pl.annotate(cities[i]["properties"]["nameascii"], pca_2010[i,0:2])
    # pl.show()

    # Create 2D matrix  if weights based on city to city longitudinal distance
    geomkey = [[] for i in range(total)]
    cityIdx = 0
    for city in cities:
        lon1 = city["properties"]["lon"]
        for comparisoncity in cities:
            lon2 = comparisoncity["properties"]["lon"]
            diff = abs(lon2-lon1)
            if diff > 60:
                geomkey[cityIdx].append(pow(diff, 2))
            elif diff > 40:
                geomkey[cityIdx].append(diff)
            else:
                geomkey[cityIdx].append(1)
        cityIdx += 1

    # Finally comparing cities by Euclidean distance
    feelslikeresults = []
    for result in pca_results:
        currentDiff = euclidean_distances(numpy.array(pca_2010), numpy.array(result))
        for p in range(total):
            for q in range(total):
                currentDiff[p][q] = int(currentDiff[p][q] * geomkey[p][q])
        feelslike = numpy.argmin(currentDiff, axis=0)
        feelslikeresults.append(feelslike)

    # Writing out results to formatted individual files
    for c in range(total):
        futurefeelslike = {"2050": None, "2099": None}
        yearIdx = 0
        for feelslike in feelslikeresults:
            futurefeelslike[years[yearIdx]] = cities[feelslike[c]]
            yearIdx += 1
        write_files(cities[c], futurefeelslike, rcp_dir_path)


def read_cities(input_path):
    """Reads the input geojson file of cities"""
    with open(input_path) as geojson_file:
        cities_geojson = geojson.load(geojson_file)
        cities = cities_geojson['features']
        logger.info('number of cities to load: {}'.format(len(cities)))

        return cities


def write_files(city, data, rcp_dir_path):
    """Write and format json for feelslike results for input city"""
    docname = city["properties"]["nameascii"].replace(" ", "-") + '--' + city["properties"]["admin"].replace(" ", "-") + '.json'
    filename = os.path.join(rcp_dir_path, docname)
    with open(filename, 'w') as new_file:
        json.dump(data, new_file)
        logger.info('Created {}:'.format(new_file))


def city_jsons_to_dict(files, rcp):
    """Compile dictionary of all cities in 1 RCP"""
    all_futures = defaultdict()
    for json_file in files:
        with open(json_file, 'r') as j:
            data = json.load(j)
            city_name_long = data['city_name']
            # Handle singular exception of Washington DC name
            if city_name_long == "Washington, D.C., United States of America":
                city_name = "Washington, D.C."
            else:
                city_name = city_name_long.split(',')[0]
            all_futures[city_name] = data[rcp]
    logger.info('Dictionary for {} complete'.format(rcp))
    return all_futures


def main():
    """Main entry point for the script"""
    parser = argparse.ArgumentParser(description='Load cities data')
    parser.add_argument('cities_profile_path', help='Path to geojson file containing city profiles')
    parser.add_argument('cities_json_path', help='Path to directory containing jsons of city climate projections')
    args = parser.parse_args()

    logger.info("Loading qualitative cities data")
    cities = read_cities(args.cities_profile_path)

    # Load all files in the directory
    files = glob.glob(args.cities_json_path + '/*.json')
    logger.info("Files to process: {}".format(len(files)))

    # Run comparison per RCP scenario
    for rcp in rcps:
        # Make directory to save outputs of RCP scenario
        rcp_dir_path = make_rcp_path(rcp)
        if not os.path.exists(rcp_dir_path):
            os.makedirs(rcp_dir_path)
            logger.info("Created {} dir".format(rcp))

        # Generate necessary data for city comparisons
        all_rcp_futures = city_jsons_to_dict(files, rcp)
        base_scale = create_scaler(cities, all_rcp_futures, "2010")
        scale2050 = create_scaler(cities, all_rcp_futures, "2050")
        scale2099 = create_scaler(cities, all_rcp_futures, "2099")

        # Compare data and write out results into jsons
        compare_cities(cities, all_rcp_futures, [base_scale, scale2050, scale2099], rcp_dir_path)

    logger.info('Comparing complete')

if __name__ == '__main__':
    main()
