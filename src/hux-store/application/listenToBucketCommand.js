import { query as queryFn, Store } from "../";

const listenToBucketCommand = async ({ name, onUpdate, query }) => {
  let processedListener = onUpdate;

  if (query) {
    processedListener = async () => {
      const updatedData = await queryFn({ name, query });
      onUpdate(updatedData);
    };
  }

  Store.buckets[name].listeners.push(processedListener);
};

export { listenToBucketCommand };
