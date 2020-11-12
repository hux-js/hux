import { createWorker } from '../../hux-workers/worker.interface';

let bitMask = 0;

const optimiseData = async ({ data }) => {
  const worker = await createWorker();

  const response = await worker.optimise({ data });

  // What bit masking can we do here?

  // indexing

  // convert keys to bitmasks?

  return response;
};

export { optimiseData };