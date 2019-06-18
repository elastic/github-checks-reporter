const Octokit = require('@octokit/rest').plugin(require('@octokit/plugin-retry'));
const nock = require('nock');

test('octokit retry configuration', async () => {
  jest.setTimeout(600000);
  nock('https://api.github.com', { allowUnmocked: true })
    .log(console.log)
    .get('/')
    .times(4)
    .reply(502, {
      license: {
        key: 'mit',
        name: 'MIT License',
        spdx_id: 'MIT',
        url: 'https://api.github.com/licenses/mit',
        node_id: 'MDc6TGljZW5zZTEz'
      }
    });

  nock('https://api.github.com', { allowUnmocked: true })
    .log(console.log)
    .get('/')
    .times(1)
    .reply(200, {
      license: {
        key: 'mit',
        name: 'MIT License',
        spdx_id: 'MIT',
        url: 'https://api.github.com/licenses/mit',
        node_id: 'MDc6TGljZW5zZTEz'
      }
    });

  const octokit = Octokit({
    request: { retries: 5 }
  });
  const result = await octokit.request('/', { request: { retries: 5, retryAfter: 30000 } });

  expect(result.data.license.key).toBe('mit');
  const result2 = await octokit.request('/');
  expect(result2.url).toBe('https://api.github.com/');
  console.log('done');
});
