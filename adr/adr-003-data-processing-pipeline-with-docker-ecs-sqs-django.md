# ADR-003 Data processing pipeline with Docker, ECS, SQS, Django

## Context

We are storing data points inside a Django application with postgres/PostGIS. We need a way to copy this data from the NEX CDF files on S3 into the database. Some code to extract this data into json files with Docker, ECS, and SQS has already been written.

## Decision

We will create a django management command to populate SQS with tasks. We will create another django management command to pull tasks from SQS and execute them. We will create a docker container for django, which will contain the django application and management commands.

When we calculate the data, we will populate the SQS queue with jobs to process. We will manually start an ECS cluster of spot instances. Then we will configure and start the ECS task with the queue processing management command.

## Status

Proposed

## Consequences

As the data processing instances should not persist  and the process will not be run frequently, the steps to process the data must be run manually. This will include setting up a cluster of spot instances, setting up the task definition, and starting many instances of the task. SQS should be monitored to ensure the tasks are running smoothly.
