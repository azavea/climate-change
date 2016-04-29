# ADR-001 Extract point data from NEX dataset for top cities

## Context

We are looking to provide an API with fast access to NEX climate data. As we don’t know the best use cases for the data, we don’t know how to tune a distributed infrastructure towards arriving at general queries.

## Decision

To reduce the size of the dataset, we will only store values for a large amount of top cities, as opposed to every cell of each raster.

## Status

Proposed

## Consequences

A relational database will be a more appropriate data store for the data.
