import * as Comlink from 'comlink';
// import { graphql } from 'graphql';

const worker = {
  optimise: ({ data }) => {
    return data;
  },
  query: ({ bucket, query }) => {
    // Can't use graphql here, can only be used to query raw data
    //const { data } = graphql(bucket.schema, query, bucket.data);

    return {};
  },
};
 
Comlink.expose(worker);
