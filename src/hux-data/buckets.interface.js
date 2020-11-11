import { v4 as uuidv4 } from 'uuid';

const buckets = {};

const bucket = () => {
  // receive data

  // optimise data

  // perform dimensional mapping

  // cache data

  // return data
};

const createBucket = ({ data }) => {
  buckets = {
    ...buckets,
    [uuidv4()]: data,
  };
};

const getBucket = ({ id }) => bucket[id];

export { bucket, createBucket, getBucket };