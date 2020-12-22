import { measureRequestPerformance } from "../application/measureRequestPerformance";
import { setupProfilerHandlersCommand } from "../application/setupProfilerHandlersCommand";

const measurePerformance = async ({ details, fn, type, eventId }) => {
  const result = await measureRequestPerformance({
    details,
    fn,
    type,
    eventId,
  });

  return result;
};

const profilerInteropHook = ({ profilerHandlers }) =>
  setupProfilerHandlersCommand({
    profilerHandlers,
  });

export { measurePerformance, profilerInteropHook };
