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

  page.on('console', msg => console.log(msg.text()))

  await page.route('**/api/hydrate', route => route.fulfill({
    status: 200,
    body: { testProp: 'mock' },
  }));

  await page.goto('http://localhost:8128/hydrate');
});

afterEach(async () => {
  await page.close();
});

it('should load test file correctly', async () => {
  expect(await page.title()).toBe('Hydrate regression test');
});

xit('should load the hydrated data correctly', async () => {
  const [response] = await Promise.all([
    page.waitForResponse('**/api/hydrate'),
    page.click('button#hydrate-button'),
  ]);

  const text = await page.innerText('#render-to');
  expect(text).toEqual('mock');
});
