import { chromium, webkit, firefox } from "playwright";
import { users, meta } from "../__mocks__/users";

const browserName = process.env.BROWSER || "webkit";
const profilerEnabled = process.env.PROFILER || false;

let browser;
let page;

beforeAll(async () => {
  browser = await { chromium, webkit, firefox }[browserName].launch();
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();

  await page.goto(
    `http://localhost:8128/query?profilerEnabled=${profilerEnabled}`
  );
});

afterEach(async () => {
  await page.close();
});

it("should load test file correctly", async () => {
  expect(await page.title()).toBe("Query regression test");
});

it("should load data correctly when root is an object", async () => {
  await Promise.all([page.click("button#query-button")]);

  await page.waitForTimeout(1000);

  const text = await page.innerText("#render-to");
  expect(text).toEqual("5 - false");
});

it("should load filtered data correctly when root is an object", async () => {
  await Promise.all([page.click("button#query-filter-button")]);

  await page.waitForTimeout(1000);

  const text = await page.innerText("#render-to");
  expect(text).toEqual(
    JSON.stringify({
      users: [users[0]],
      images: [meta.images[0]],
      selected: meta.selected,
    })
  );
});

it("should load queried data correctly when root is an array", async () => {
  await Promise.all([page.click("button#query-array-button")]);

  await page.waitForTimeout(1000);

  const text = await page.innerText("#render-to");
  expect(text).toEqual(JSON.stringify(users));
});

it("should load filtered data correctly when root is an array", async () => {
  await Promise.all([page.click("button#query-array-filter-button")]);

  await page.waitForTimeout(1000);

  const text = await page.innerText("#render-to");
  expect(text).toEqual(JSON.stringify([users[0]]));
});
