import { createWorker, WorkerEvent } from "../../hux-workers";
import {
  triggerListeners,
  query as queryBucket,
  listenToBucket,
} from "../../hux-store";

const hydrateServerRequest = async ({ request, query, eventId }) => {
  const worker = await createWorker();

  await worker.dispatcher(JSON.stringify(request));

  const queryResponse = await queryBucket({
    name: request.name,
    query: query || [],
    eventId,
  });

  const response = {
    result: queryResponse,
    metrics: { details: { dataFrom: "Server" } },
  };

  return response;
};

const hydrateRequest = async ({
  url,
  options,
  aggregations,
  schema,
  query,
  name,
  hasKey,
  onUpdate,
  eventId,
}) => {
  let response;

  const stringifiedAggregations = aggregations.map((aggregation) =>
    aggregation.toString()
  );

  const request = {
    eventType: WorkerEvent.HYDRATE,
    url,
    options,
    aggregations: stringifiedAggregations,
    schema,
    name,
    hasKey,
  };

  if (query) {
    const cachedQueryResponse = await queryBucket({
      name,
      query,
      eventId,
    });

    if (cachedQueryResponse) {
      response = {
        result: cachedQueryResponse,
        metrics: { details: { dataFrom: "Cache" } },
      };

      // Set up async revalidation so we can return cached response early
      (async () => {
        const queryResponse = await hydrateServerRequest({
          request,
          query,
          eventId,
        });

        triggerListeners({ name, data: queryResponse.result });
      })();
    } else {
      response = await hydrateServerRequest({
        request,
        query,
        eventId,
      });
    }
  } else {
    response = await hydrateServerRequest({ request, eventId });
  }

  triggerListeners({ name, data: response.result });

  // Set onUpdate after triggerListeners
  // so we don't duplicate the data response
  if (onUpdate && query) {
    listenToBucket({ name, onUpdate, query });
  }

  return response;
};

export { hydrateRequest };
