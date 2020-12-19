import * as Comlink from "comlink";

import workerString from "../../../dist/worker.bundle.umd";
import { WorkerEventType } from "../domain/WorkerEvent";
import { memorySizeOf } from "../utils/worker";

let proxy;

const createWorker = async () => {
  if (!proxy && Worker) {
    const workerBlob = new Blob([workerString]);
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);
    proxy = Comlink.wrap(worker);
  }

  return proxy;
};

const WorkerEvent = WorkerEventType;

const getSizeOfMemory = memorySizeOf;

export { createWorker, WorkerEvent, getSizeOfMemory };
