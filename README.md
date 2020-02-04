# climate-change
Azavea Climate Change project


# Web app

Lives in `./web`, to develop, you'll need to install gulp and bower via npm:
```
npm install -g gulp bower
```

Then install node and bower dependencies:
```
npm install && bower install
```

Gulp tasks:
- `$ gulp` to build an optimized version of your application in folder dist
- `$ gulp serve` to start BrowserSync server on your source files with live reload
- `$ gulp serve:dist` to start BrowserSync server on your optimized application without live reload
- `$ gulp test` to run your unit tests with Karma
- `$ gulp test:auto` to run your unit tests with Karma in watch mode
- `$ gulp protractor` to launch your e2e tests with Protractor
- `$ gulp protractor:dist` to launch your e2e tests with Protractor on the dist files

# Web app deployment

Inside `./web`:

```bash
export CC_S3_ID=THE_DEPLOYMENT_AWS_KEY_ID
export CC_S3_SECRET=THE_DEPLOYMENT_AWS_SECRET_KEY
gulp && s3_website push

```

# Aggregate data

If you do not have data downloaded, have `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your
environment.

In the `climate-change/indicators` directory, run:

```bash
python -m indicators.aggregate DATADIR OUTDIR
```

`DATADIR` is the directory with json files from the nex2json output process. If the files are
unavailable locally they will be downloaded from S3.

`OUTDIR` is the dir you would like the city json files written to.


