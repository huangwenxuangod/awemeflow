import type { TraceEvent } from './types';

const TRACE_MESSAGES: Record<string, string> = {
  input: '收到解析请求',
  short_link: '解析抖音短链接',
  aweme_id: '确定作品 ID',
  cache_hit: '复用解析结果缓存',
  ttwid_cache_hit: '复用已缓存的匿名 ttwid',
  ttwid_register: '注册匿名 ttwid',
  share_fetch: '请求 SSR 分享页',
  router_data_parse: '解析分享页数据',
  resolve_success: '解析成功',
};

export class DouyinTrace {
  readonly id = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  readonly events: TraceEvent[] = [];

  constructor(private readonly enabled = false) {}

  add(stage: string, data: Record<string, unknown> = {}) {
    const event: TraceEvent = {
      time: new Date().toISOString(),
      stage,
      message: TRACE_MESSAGES[stage] ?? stage,
      ...data,
    };

    console.info(JSON.stringify({ traceId: this.id, ...event }));

    if (this.enabled) {
      this.events.push(event);
    }
  }
}
