import { measureRequestPerformance } from "../application/measureRequestPerformance";

const measurePerformance = async ({ details, fn, type, worker }) => {
  const result = await measureRequestPerformance({ details, fn, type, worker });

  return result;
};

export { measurePerformance };
