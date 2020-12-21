import { chromium, webkit, firefox } from 'playwright';

const browserName = process.env.BROWSER || 'webkit';

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

  await page.route('http://localhost:8128/api/hydrate', route => route.fulfill({
    status: 200,
    body: JSON.stringify({ testProp: 'mock' }),
  }));

  await page.goto('http://localhost:8128/hydrate');
});

afterEach(async () => {
  await page.close();
});

it('should load test file correctly', async () => {
  expect(await page.title()).toBe('Hydrate regression test');
});

it('should load the hydrated data correctly', async () => {
  await Promise.all([
    page.waitForResponse('http://localhost:8128/api/hydrate'),
    page.click('button#hydrate-button'),
  ]);

  const text = await page.innerText('#render-to');
  expect(text).toEqual('mock');
});
