import * as Comlink from 'comlink';

import workerString from '../../dist/worker.bundle.umd';

const createWorker = async () => {
  const workerBlob = new Blob([workerString]);
  const workerUrl = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerUrl);
  const proxy = Comlink.wrap(worker);

  return proxy;
};

export { createWorker };