import { createBucket } from '../hux-data/buckets.interface';

const TEST_DATA = {
  id: 123,
  email: 'test@test.com',
  messageCount: 256,
};

const hydrate = ({ name }) => {
  // API call

  return createBucket({ data: TEST_DATA, name });
};

export { hydrate };