#Hux

## APIs generate workers. Buckets are chunks of optimised API data that operate within workers.

Request -> Bucket creation -> data optimisation/aggregation in web worker -> return to user

Why hydrate and sync? 
We're using this terminology to support the fact that we are operating on buckets of data, rather than just interacting with an API.

Why Hux?
A lot of codebases suffer from duplication due to the many to many design of the data flow, especially on larger projects
that multiple teams are pushing changes to. If we think about the FE with DDD in mind we start to gain a little bit of control over this. Also stateful stores are used to contain _all_ the data of an application which is wrong.

## TODO:
- use indexedDB?
- optimise data
- aggregate data
- run worker interops
- caching?
- Re-sync data from state and use sync() to post to BE

## How to demo?
There are 3 ways to query large datasets in the client:

1. Re-fetch from the API with the new parameters (less data stored in the browser, interactions are slow, no offline access)
2. Run queries on un-optimised data directly in the browser (a lot of data stored in the browser, interactions are slow, offline access)
3. Run queries on optimised/aggregated data in workers in the browser (a lot of data stored in the browser, interactions are fast, offline access)

Hux utilises the 3rd option

You can use the profiler to test your aggregation functions and improve their performance/response times. You can also use it to run test queries on your data