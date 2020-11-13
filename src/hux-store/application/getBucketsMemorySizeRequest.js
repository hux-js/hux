import { createWorker, WorkerEvent } from "../../hux-workers";
import { Store } from "../";

const getBucketsMemorySizeRequest = async () => {
  const worker = await createWorker();

  const result = await worker.dispatcher(
    JSON.stringify({ eventType: WorkerEvent.GET_MEMORY_SIZE })
  );

  const date = new Date();
  date.setSeconds(0, 0);

  Store.metrics.memoryUsage.push({
    x: date.toISOString(),
    y: JSON.parse(result),
  });

  return Store.metrics.memoryUsage;
};

export { getBucketsMemorySizeRequest };
