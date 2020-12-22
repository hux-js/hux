import { hydrateRequest } from "../hydrateRequest";

import { triggerListeners, query, listenToBucket } from "../../../hux-store";

const flushPromises = () => new Promise((resolve) => process.nextTick(resolve));

jest.mock("../../../hux-workers", () => ({
  createWorker: jest.fn().mockReturnValue(
    Promise.resolve({
      dispatcher: jest.fn().mockReturnValue(Promise.resolve({})),
    })
  ),
  WorkerEvent: {
    HYDRATE: "HYDRATE",
  },
}));

jest.mock("../../../hux-store", () => ({
  query: jest.fn().mockReturnValue(Promise.resolve({})),
  listenToBucket: jest.fn(),
  triggerListeners: jest.fn(),
}));

describe("hydrateRequest", () => {
  const defaultRequest = {
    url: "http://localhost",
    options: {},
    aggregations: [],
    schema: {},
    name: "mock-bucket",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Given a basic hydrate request", () => {
    const request = {
      ...defaultRequest,
    };

    describe("When hydrateRequest is called", () => {
      let result;

      beforeEach(async () => {
        result = await hydrateRequest(request);
      });

      test("Then the listeners are triggered with the correct data", () => {
        expect(triggerListeners).toHaveBeenCalledWith({
          name: "mock-bucket",
          data: {},
        });
      });

      test("Then listenToBucket is NOT called", () => {
        expect(listenToBucket).not.toHaveBeenCalled();
      });

      test("Then the correct server response is returned", () => {
        expect(result).toEqual({
          metrics: {
            details: {
              dataFrom: "Server",
            },
          },
          result: {},
        });
      });
    });
  });

  describe("Given a hydrate request with query and a listener", () => {
    const request = {
      ...defaultRequest,
      query: [],
      onUpdate: () => {},
    };

    describe("When hydrateRequest is called and cache is available", () => {
      let result;

      beforeEach(async () => {
        query
          .mockReturnValueOnce(Promise.resolve({ foo: "cached" }))
          .mockReturnValueOnce(Promise.resolve({ foo: "server" }));
        result = await hydrateRequest(request);

        await flushPromises();
      });

      test("Then the listeners are triggered with the correct data for both cache and server", () => {
        expect(triggerListeners.mock.calls).toEqual([
          [
            {
              name: "mock-bucket",
              data: {
                foo: "cached",
              },
            },
          ],
          [
            {
              name: "mock-bucket",
              data: {
                foo: "server",
              },
            },
          ],
        ]);
      });

      test("Then listenToBucket is called with the correct data", () => {
        expect(listenToBucket).toHaveBeenCalledWith({
          name: "mock-bucket",
          onUpdate: request.onUpdate,
          query: [],
        });
      });

      test("Then the correct cached response is returned", () => {
        expect(result).toEqual({
          metrics: {
            details: {
              dataFrom: "Cache",
            },
          },
          result: {
            foo: "cached",
          },
        });
      });
    });

    describe("When hydrateRequest is called and cache is NOT available", () => {
      let result;

      beforeEach(async () => {
        query
          .mockReturnValueOnce(Promise.resolve())
          .mockReturnValueOnce(Promise.resolve({ foo: "server" }));
        result = await hydrateRequest(request);

        await flushPromises();
      });

      test("Then the listeners are triggered with the correct data for just server", () => {
        expect(triggerListeners.mock.calls).toEqual([
          [
            {
              name: "mock-bucket",
              data: {
                foo: "server",
              },
            },
          ],
        ]);
      });

      test("Then listenToBucket is called with the correct data", () => {
        expect(listenToBucket).toHaveBeenCalledWith({
          name: "mock-bucket",
          onUpdate: request.onUpdate,
          query: [],
        });
      });

      test("Then the correct server response is returned", () => {
        expect(result).toEqual({
          metrics: {
            details: {
              dataFrom: "Server",
            },
          },
          result: {
            foo: "server",
          },
        });
      });
    });
  });
});
