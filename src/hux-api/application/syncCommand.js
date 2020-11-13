import { createWorker, WorkerEvent } from "../../hux-workers";
import { triggerListeners } from "../../hux-store";

const syncCommand = async ({ name, data, mode, url, options }) => {
  const worker = await createWorker();

  const response = JSON.parse(
    await worker.dispatcher(
      JSON.stringify({
        eventType: WorkerEvent.SYNC,
        name,
        data,
        mode,
        url,
        options,
      })
    )
  );

  triggerListeners({ name, data: response });

  return response;
};

export { syncCommand };
