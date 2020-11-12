import { hydrate } from './hux-api';
import { queryBucket as query } from './hux-data';
import { profiler, measureQueryPerformance } from './hux-profiler';
import { NAME, QUERY, PROFILER } from './test.config';

const hux = async ({ name, profiler }) => {
  let response;

  hydrate({ name });

  if (profiler) {
    response = await measureQueryPerformance({
      query: async () => await query({ name, query: QUERY })
    });
  } else {
    response = await query({ name, query: QUERY });
  }

  return response;
}

// Usage
// hux({
//   name: NAME,
//   query: QUERY,
//   profiler: PROFILER,
// });

export {
  hux,
  hydrate,
  query,
  profiler,
};