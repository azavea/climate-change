##########################################
## DOEE - Climate Change
## 
## Script for creating and formatting a 
## separate JSON file for each study city
##
## Azavea Inc, 2016
##########################################

import argparse
import logging
import geojson
import json
import glob
import os
import math
from collections import defaultdict
from sklearn import preprocessing, decomposition
from sklearn.metrics.pairwise import euclidean_distances
import numpy as numpy
import pprint
import pylab as pl

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

rcp_paths = {
	'rcp45': './data/feelslike/rcp45/',
	'rcp85': './data/feelslike/rcp85/'
	}
years = ["2050", "2099"]
months = ["1","2","3","4","5","6","7","8","9","10","11","12"]

def create_scaler(cities, all_futures, year):
	master_array= list()
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

def compare_cities(cities, all_futures, scales):
	logger.info('Comparing cities now')
	pca_results = []
	base = preprocessing.StandardScaler().fit(scales[0])
	pca = decomposition.PCA(n_components = .99).fit(base.transform(scales[0])) # PCA for 99% of variance
	for scale in scales:
		X = base.transform(scale)
		Y = pca.transform(X)
		pca_results.append(Y)
	pca_2010 = pca_results.pop(0)
	total = pca_2010.shape[0]

	# pl.scatter(pca_2010[:, 0], pca_2010[:, 1])
	# for i in range(total):
	#	pl.annotate(cities[i]["properties"]["nameascii"], pca_2010[i,0:2])
	# pl.show()

	# Create 2D matrix of city to city distance
	geomkey = [[] for i in range(total)]
	cityIdx = 0
	for city in cities:
		lon1 = city["properties"]["lon"]
		for comparisoncity in cities:
			lon2 = comparisoncity["properties"]["lon"]
			diff = abs(lon2-lon1)
			if diff > 40:
				geomkey[cityIdx].append(pow(diff, 2))
			elif diff > 20:
				geomkey[cityIdx].append(diff)
			else:
				geomkey[cityIdx].append(1)
		cityIdx += 1

	feelslikeresults = []
	for result in pca_results:
		currentDiff = euclidean_distances(numpy.array(pca_2010), numpy.array(result))
		pprint.pprint(currentDiff)
		for p in range(total):
			for q in range(total):
				currentDiff[p][q] = int(currentDiff[p][q] * geomkey[p][q])
		pprint.pprint(currentDiff)
		feelslike = numpy.argmin(currentDiff, axis=0)
		feelslikeresults.append(feelslike)

	for c in range(total):
		futurefeelslike = {"2050": None, "2099": None}
		yearIdx = 0
		for feelslike in feelslikeresults:
			futurefeelslike[years[yearIdx]] = cities[feelslike[c]]
			yearIdx +=1
		write_files(cities[c], futurefeelslike)
	return

def set_current_rcp(rcp):
	global current_rcp
	current_rcp = rcp
	return

def read_cities(input_path):
	"""Reads the input geojson file of cities"""
	with open(input_path) as geojson_file:
		try:
			cities_geojson = geojson.load(geojson_file)
		except Exception:
			logger.exception('Error parsing cities GeoJSON file:')
			sys.exit()

		cities = cities_geojson['features']
		logger.info('number of cities to load: {}'.format(len(cities)))

		# If there are no cities to load from the file, exit
		if not len(cities):
			logger.info('no cities to load, exiting')
			sys.exit()

		return cities

def write_files(city, data):
	docname = city["properties"]["nameascii"].replace(" ", "-") + '--' + city["properties"]["admin"].replace(" ", "-") + '.json'
	this_folder_path = rcp_paths[current_rcp]
	filename = os.path.join(this_folder_path, docname)
	try:
		new_file = open(filename, 'w')
	except Exception:
		logger.info('Error creating new file')
		return

	if new_file:
		# TODO: Direct to save in a new directory
		json.dump(data, new_file)
		new_file.close()
		logger.info('Created {}:'.format(new_file))
		return

def city_jsons_to_dict(files, rcp):
	all_futures = defaultdict()
	set_current_rcp(rcp)
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
	parser.add_argument('cities_json_dir', help='Path to directory containing jsons of city climate projections')
	args = parser.parse_args()

	logger.info("Loading qualitative cities data")
	cities = read_cities(args.cities_profile_path)

	# Load all files in the directory
	files = glob.glob(args.cities_json_dir + '/*.json')
	logger.info("Files to process: {}".format(len(files)))

	# Create directories for output json files
	rcp45_dir_path = rcp_paths['rcp45']
	rcp85_dir_path = rcp_paths['rcp85']
	if not os.path.exists(rcp45_dir_path):
		os.makedirs(rcp45_dir_path)
		logger.info("Created rcp45 dir")
	if not os.path.exists(rcp85_dir_path):
		os.makedirs(rcp85_dir_path)
		logger.info("Created rcp85 dir")

	# Create dictionaries of all city climate projection jsons by RCP
	# Compare cities output "feelslike" json by RCP
	all_rcp45_futures = city_jsons_to_dict(files, 'rcp45')
	all_rcp85_futures = city_jsons_to_dict(files, 'rcp85')

	# Create data scales
	base_scale = create_scaler(cities, all_rcp45_futures, "2010")
	scale2050 = create_scaler(cities, all_rcp45_futures, "2050")
	scale2099 = create_scaler(cities, all_rcp45_futures, "2099")
	compare_cities(cities, all_rcp45_futures, [base_scale, scale2050, scale2099])

	# Create data scales
	base_scale = create_scaler(cities, all_rcp85_futures, "2010")
	scale2050 = create_scaler(cities, all_rcp85_futures, "2050")
	scale2099 = create_scaler(cities, all_rcp85_futures, "2099")
	compare_cities(cities, all_rcp85_futures, [base_scale, scale2050, scale2099])

	logger.info('Comparing complete')


if __name__ == '__main__':
	main()
