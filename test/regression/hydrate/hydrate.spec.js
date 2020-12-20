import { chromium, webkit, firefox } from 'playwright';

// const browserName = process.env.BROWSER || 'webkit';
const browserName = 'chromium';

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
});

afterEach(async () => {
  await page.close();
});

it('should load test file correctly', async () => {
  await page.goto('http://localhost:8128');
  expect(await page.title()).toBe('Hydrate regression test');
});
