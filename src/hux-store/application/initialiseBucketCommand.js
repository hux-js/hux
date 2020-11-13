import { createWorker, WorkerEvent } from "../../hux-workers";

const initialiseBucketCommand = async ({ name, schema, hasKey }) => {
  const worker = await createWorker();

  worker.dispatcher(
    JSON.stringify({
      eventType: WorkerEvent.INITIALISE_BUCKET,
      name,
      schema,
      hasKey,
    })
  );
};

export { initialiseBucketCommand };