# ADR-002 Django Application with postgres

## Context

We have decided a relational database is the appropriate data store for NEX climate data for this phase of the project. We need a way for users to access the data via an API. 

## Decision

We will build a Django Application with postgres/PostGIS as the underlying database. Users will access the data through an Django powered API. We will use a large (~200GB) database on Amazon RDS with point data for each of ~16K places.

## Status

Proposed

## Consequences

We will need to find a way to copy NEX data from CDF files in S3 into the database.
