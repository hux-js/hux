import { Store } from "../";

const triggerListenersCommand = async ({ name, data }) => {
  const listenerFunctions = Store.buckets[name].listeners;

  if (listenerFunctions) {
    for (let i = 0; i < listenerFunctions.length; i++) {
      listenerFunctions[i](data);
    }
  }
};

export { triggerListenersCommand };