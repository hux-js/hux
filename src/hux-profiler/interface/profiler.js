import { measureRequestPerformance } from "../application/measureRequestPerformance";

const measurePerformance = async ({ details, fn, type, eventId }) => {
  const result = await measureRequestPerformance({ details, fn, type, eventId });

  return result;
};

export { measurePerformance };
