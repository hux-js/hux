import { chromium, webkit, firefox } from "playwright";

const browserName = process.env.BROWSER || "webkit";
const profilerEnabled = process.env.PROFILER || false;
const API_URI = "http://localhost:8128/api/hydrate";

let browser;
let page;
let callCounter = 1;

beforeAll(async () => {
  browser = await { chromium, webkit, firefox }[browserName].launch();
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();

  await page.route(API_URI, (route) => {
    const userCount = callCounter === 1 ? "5" : "5-revalidated";
    callCounter++;

    return route.fulfill({
      status: 200,
      body: JSON.stringify({ userCount }),
    });
  });

  await page.goto(
    `http://localhost:8128/hydrate?profilerEnabled=${profilerEnabled}`
  );
});

afterEach(async () => {
  await page.close();
  callCounter = 1;
});

it("should load test file correctly", async () => {
  expect(await page.title()).toBe("Hydrate regression test");
});

it("should load hydrated data correctly", async () => {
  await Promise.all([
    page.waitForResponse(API_URI),
    page.click("button#hydrate-button"),
  ]);

  await page.waitForTimeout(1000);

  const text = await page.innerText("#render-to");
  expect(text).toEqual("5");
});

it("should call onUpdate when the cache revalidates", async () => {
  // Set the data in the cache
  await Promise.all([
    page.waitForResponse(API_URI),
    page.click("button#hydrate-onUpdate-button"),
  ]);

  await page.waitForTimeout(1000);

  const text = await page.innerText("#render-to");
  expect(text).toEqual("5");

  await page.waitForTimeout(2000);

  // Re-call hydrate so we retrieve cached data
  await Promise.all([
    page.waitForResponse(API_URI),
    page.click("button#hydrate-onUpdate-button"),
  ]);

  await page.waitForTimeout(1000);

  const revalidatedText = await page.innerText("#render-to");
  expect(revalidatedText).toEqual("onUpdate-5-revalidated");
});
