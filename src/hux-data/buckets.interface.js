import { v4 as uuidv4 } from 'uuid';
import { graphql, buildSchema } from 'graphql';

import { optimiseData } from './utils/optimiseData';
import { aggregateData } from './utils/aggregateData';

let buckets = {}; // Should this be in IDB?

const createBucket = async ({
  data,
  name,
  userSchema,
  query,
}) => {
  const bucketId = uuidv4();
  const schema = userSchema
    ? userSchema
    : buildSchema(`
      type Query {
        id: String
        email: String
        messageCount: String
      }
    `);

  const optimisedData = await optimiseData({ data });
  const aggregatedData = aggregateData({ data: optimisedData });

  const bucket = {
    [name || bucketId]: {
      schema,
      data: aggregatedData,
    },
  };

  buckets = {
    ...buckets,
    ...bucket,
  };

  return query ? queryBucket({ name, query }) : aggregatedData;
};

const queryBucket = async ({ name, query }) => {
  const bucket = buckets[name];

  const { data } = await graphql(bucket.schema, query, bucket.data);

  return data;
};

export { createBucket, queryBucket };