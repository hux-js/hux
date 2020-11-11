import { getBucket } from '../hux-data/buckets.interface'

const createWorker = () => {
  const worker = new Worker("worker.js");

  return worker;
};

const interOp = ({ task, bucketId, worker }) => {
  const bucket = getBucket({ bucketId });

  const response = worker.postMessage(bucket, task);

  return response;
};

export { createWorker, interOp };