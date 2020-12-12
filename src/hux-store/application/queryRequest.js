import { createWorker, WorkerEvent } from "../../hux-workers";
import { listenToBucket } from "../";

const queryRequest = async ({ name, query, onUpdate }) => {
  const worker = await createWorker();

  if (onUpdate) {
    listenToBucket({ name, onUpdate, query });
  }

  const response = JSON.parse(
    await worker.dispatcher(
      JSON.stringify({
        eventType: WorkerEvent.QUERY,
        query,
        name,
      })
    )
  );

  return response;
};

export { queryRequest };
