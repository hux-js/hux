import { createWorker, WorkerEvent } from "../../hux-workers";
import { triggerListeners, query as queryBucket } from "../../hux-store";

const hydrateRequest = async ({
  url,
  options,
  aggregations,
  schema,
  query,
  name,
  hasKey,
  onUpdate,
}) => {
  let response;
  const worker = await createWorker();

  const stringifiedAggregations = aggregations.map((aggregation) =>
    aggregation.toString()
  );

  const request = JSON.stringify({
    eventType: WorkerEvent.HYDRATE,
    url,
    options,
    aggregations: stringifiedAggregations,
    schema,
    name,
    hasKey,
  });

  if (query) {
    const cachedQueryResponse = await queryBucket({
      name,
      query,
      onUpdate,
    });

    if (cachedQueryResponse) {
      response = {
        result: cachedQueryResponse,
        metrics: { details: { dataFrom: "Cache" } },
      };

      (async () => {
        const revalidatedResponse = JSON.parse(
          await worker.dispatcher(request)
        );

        triggerListeners({ name, data: revalidatedResponse });
      })();
    } else {
      await worker.dispatcher(request);

      const syncQueryResponse = await queryBucket({ name, query, onUpdate });

      response = {
        result: syncQueryResponse,
        metrics: { details: { dataFrom: "Server" } },
      };
    }
  } else {
    response = JSON.parse(await worker.dispatcher(request));
  }

  triggerListeners({ name, data: response });

  return response;
};

export { hydrateRequest };
