export const DOUYIN_ORIGIN = 'https://www.douyin.com';
export const IES_DOUYIN_ORIGIN = 'https://www.iesdouyin.com';
export const PLAY_ORIGIN = 'https://aweme.snssdk.com';
export const TTWID_REGISTER_URL =
  'https://ttwid.bytedance.com/ttwid/union/register/';

export const SHARE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ' +
  'MicroMessenger/8.0.49 NetType/WIFI Language/zh_CN';

export const REQUEST_TIMEOUT_MS = 15_000;
export const MAX_INPUT_LENGTH = 8_192;
export const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
export const MAX_REDIRECTS = 5;
export const RESULT_CACHE_TTL_SECONDS = 300;
export const TTWID_CACHE_TTL_SECONDS = 86_400;

export const ALLOWED_INPUT_HOSTS = new Set([
  'douyin.com',
  'www.douyin.com',
  'v.douyin.com',
  'iesdouyin.com',
  'www.iesdouyin.com',
]);

export const ALLOWED_REDIRECT_HOSTS = new Set([
  ...ALLOWED_INPUT_HOSTS,
  'www.douyin.com',
]);
