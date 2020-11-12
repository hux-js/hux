const profiler = () => {};

const measureQueryPerformance = async ({ query }) => {
  const start = performance.now();
  const result = await query();
  const end = performance.now();

  const perfMessage = `Query took ${(end - start).toFixed(3)} milliseconds to execute`;

  return {
    result,
    perfMessage,
  };
}

export { profiler, measureQueryPerformance };