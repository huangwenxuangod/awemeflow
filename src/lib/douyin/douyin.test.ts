import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeAweme } from './aweme';
import { DouyinError } from './errors';
import { extractAwemeId, extractUrl, normalizeInput } from './input';
import { extractAwemeList, extractRouterData } from './router-data';

test('extracts aweme IDs from supported input formats', () => {
  assert.equal(
    extractAwemeId(
      'https://www.douyin.com/video/7512345678901234567?previous_page=app'
    ),
    '7512345678901234567'
  );
  assert.equal(
    extractAwemeId('https://www.douyin.com/?modal_id=7512345678901234567'),
    '7512345678901234567'
  );
  assert.equal(
    extractAwemeId('作品 ID 是 7512345678901234567'),
    '7512345678901234567'
  );
});

test('extracts a Douyin URL from share text and rejects other hosts', () => {
  assert.equal(
    extractUrl('复制打开抖音，看看视频 https://v.douyin.com/abc123/ 更多内容')
      ?.hostname,
    'v.douyin.com'
  );

  assert.throws(
    () => extractUrl('https://example.com/video/7512345678901234567'),
    (error) => error instanceof DouyinError && error.code === 'UNSUPPORTED_HOST'
  );
});

test('normalizes input and rejects empty payloads', () => {
  assert.deepEqual(
    normalizeInput({
      awemeId: '7512345678901234567',
      ratio: '720p',
    }),
    {
      text: '',
      explicitId: '7512345678901234567',
      ratio: '720p',
    }
  );

  assert.throws(
    () => normalizeInput({}),
    (error) => error instanceof DouyinError && error.code === 'MISSING_INPUT'
  );
});

test('parses nested ROUTER_DATA and discovers aweme objects', () => {
  const html = `
    <script>
      window._ROUTER_DATA = {
        "loaderData": {
          "video": {
            "aweme_detail": {
              "aweme_id": "7512345678901234567",
              "desc": "test video",
              "video": {
                "play_addr": {
                  "uri": "video-token",
                  "url_list": ["https://example.invalid/video.mp4"]
                }
              }
            }
          }
        }
      };
    </script>
  `;
  const routerData = extractRouterData(html);
  const items = extractAwemeList(routerData);

  assert.equal(items.length, 1);
  assert.equal(items[0]?.aweme_id, '7512345678901234567');
});

test('parses URL-encoded RENDER_DATA', () => {
  const payload = encodeURIComponent(
    JSON.stringify({
      data: {
        aweme_id: '7512345678901234567',
        video: {
          play_addr: {
            uri: 'video-token',
          },
        },
      },
    })
  );
  const routerData = extractRouterData(
    `<script id="RENDER_DATA" type="application/json">${payload}</script>`
  );

  assert.equal(extractAwemeList(routerData).length, 1);
});

test('normalizes aweme data and builds the play URL', () => {
  const result = normalizeAweme(
    {
      aweme_id: '7512345678901234567',
      desc: 'test video',
      create_time: 1_700_000_000,
      author: {
        uid: 'author-id',
        sec_uid: 'author-sec-id',
        nickname: 'author',
      },
      video: {
        cover: {
          url_list: ['https://example.invalid/cover.jpg'],
        },
        play_addr: {
          uri: 'video-token',
          width: 1080,
          height: 1920,
        },
      },
    },
    'https://www.douyin.com/video/7512345678901234567',
    '1080p'
  );

  assert.equal(result.awemeId, '7512345678901234567');
  assert.equal(result.authorNickname, 'author');
  assert.equal(result.width, 1080);
  assert.match(result.videoUrl, /video_id=video-token/);
  assert.match(result.videoUrl, /ratio=1080p/);
});
