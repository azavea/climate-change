import json

from boto.s3.connection import S3Connection
import os.path

S3_BUCKET = 'nex-json'
FILE_PATH_TEMPLATE = '{scenario}/{variable}/{model}'
FILE_TEMPLATE = '{variable}_day_BCSD_{scenario}_r1i1p1_{model}_{year}.json'
KEY_TEMPLATE = FILE_PATH_TEMPLATE + '/' + FILE_TEMPLATE

conn = S3Connection()


def pull_s3(rcp, variable, model, year, dest):
    filename = FILE_TEMPLATE.format(scenario=rcp,
                                    variable=variable,
                                    model=model,
                                    year=year,
                                    dest=dest)
    path = os.path.join(dest, filename)
    if not os.path.exists(path):
        bucket = conn.get_bucket(S3_BUCKET)
        key_name = KEY_TEMPLATE.format(scenario=rcp,
                                       variable=variable,
                                       model=model,
                                       year=year)
        print key_name
        key = bucket.get_key(key_name)
        with open(path, 'wb') as f:
            key.get_file(f)
    with open(path, 'r') as f:
        return json.load(f)
