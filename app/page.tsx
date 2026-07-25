"use client";

import { useMemo, useState } from "react";

type Category = "模型" | "开放生态" | "基础设施" | "社会情绪";

type Story = {
  id: string;
  rank: string;
  category: Category;
  state: string;
  title: string;
  summary: string;
  why: string;
  heat: number;
  change: string;
  community: string;
  editorial: string;
  sources: string[];
  link: string;
  linkLabel: string;
  accent: "coral" | "green" | "amber" | "blue";
};

const stories: Story[] = [
  {
    id: "opus-5",
    rank: "01",
    category: "模型",
    state: "已形成热点",
    title: "Claude Opus 5 发布，真实讨论量已经爆发",
    summary:
      "接近 Fable 5 的能力，价格减半，首批开发者把注意力集中在长任务、Coding Agent 与低 effort 性价比。",
    why: "发布不足一天，社区已经从跑分转向额度消耗、稳定性与真实工作流验证。",
    heat: 5,
    change: "+86%",
    community: "17 个 Reddit 帖 · 10,275 赞 · 1,943 评论",
    editorial: "量子位 · Latent Space · Anthropic",
    sources: ["Reddit", "HN", "GitHub", "官方"],
    link: "https://www.anthropic.com/news/claude-opus-5",
    linkLabel: "查看官方发布",
    accent: "coral",
  },
  {
    id: "open-weight",
    rank: "02",
    category: "开放生态",
    state: "已形成热点",
    title: "中国开放权重模型，正在演变成美国 AI 政策内战",
    summary:
      "创业公司、云厂商与芯片公司反对广泛限制，争论焦点从模型安全转向成本、供应商选择与市场集中度。",
    why: "这是一场开放生态与闭源巨头商业模式之间的利益冲突，不只是中美竞争新闻。",
    heat: 5,
    change: "+71%",
    community: "21 个 Reddit 帖 · 12,418 赞 · 2,307 评论",
    editorial: "Washington Post · HN · BAAI Hub",
    sources: ["Reddit", "HN", "GitHub", "媒体"],
    link:
      "https://www.washingtonpost.com/technology/2026/07/24/top-tech-firms-urge-us-government-not-limit-open-ai-models/",
    linkLabel: "查看争议全貌",
    accent: "green",
  },
  {
    id: "infrastructure",
    rank: "03",
    category: "基础设施",
    state: "正在形成",
    title: "AI 数据中心风险，从耗电升级为电网稳定性与隐性债务",
    summary:
      "输电线路故障触发数据中心大规模切换备用电源，另一边，特殊目的载体正在把 AI 基建债务扩散到更广泛的金融体系。",
    why: "算力扩张第一次同时暴露出物理基础设施脆弱性和金融工程风险。",
    heat: 4,
    change: "+42%",
    community: "HN 685 分 · 375 评论",
    editorial: "TechCrunch · Bank of England · Reuters",
    sources: ["HN", "监管", "媒体"],
    link:
      "https://www.bankofengland.co.uk/financial-stability-report/2026/july-2026",
    linkLabel: "查看金融稳定报告",
    accent: "amber",
  },
  {
    id: "avoiding-ai",
    rank: "04",
    category: "社会情绪",
    state: "早期信号",
    title: "“Avoiding AI”工作坊走红，反 AI 情绪开始产品化",
    summary:
      "图书馆开始教普通人减少对生成式 AI 和大型科技平台的依赖，活动帖传播量远超该机构的日常内容。",
    why: "它还不是全网热点，但可能是消费者反弹从观点走向服务和线下活动的起点。",
    heat: 3,
    change: "+29%",
    community: "Instagram 2,000+ 赞 · 220 次分享",
    editorial: "TechCrunch · Free Library",
    sources: ["Instagram", "媒体", "机构"],
    link:
      "https://tech.yahoo.com/ai/articles/librarians-hosting-viral-avoiding-ai-160000074.html",
    linkLabel: "查看趋势报道",
    accent: "blue",
  },
];

const filters: Array<"全部" | Category> = [
  "全部",
  "模型",
  "开放生态",
  "基础设施",
  "社会情绪",
];

const watchItems = [
  {
    time: "12:30",
    title: "Opus 5 长周期任务反馈",
    note: "观察性能回调、限额消耗与 Coding Agent 稳定性",
  },
  {
    time: "15:00",
    title: "开放权重联署后续",
    note: "跟进美国政策表态，以及创业公司与头部实验室的分歧",
  },
  {
    time: "18:30",
    title: "AI 基建风险扩散",
    note: "检查电网事件是否形成更大范围的监管或资本市场讨论",
  },
];

function HeatMeter({ value }: { value: number }) {
  return (
    <span className="heat-meter" aria-label={`热度 ${value} 星`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} className={index < value ? "active" : ""} />
      ))}
    </span>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <article className={`story-card accent-${story.accent}`}>
      <div className="story-rail">
        <span className="story-rank">{story.rank}</span>
        <span className="story-category">{story.category}</span>
      </div>
      <div className="story-content">
        <div className="story-meta">
          <span className="state-dot" />
          <span>{story.state}</span>
          <HeatMeter value={story.heat} />
          <span className="trend-up">{story.change}</span>
        </div>
        <h3>{story.title}</h3>
        <p className="story-summary">{story.summary}</p>
        <div className="signal-grid">
          <div>
            <span>社区信号</span>
            <strong>{story.community}</strong>
          </div>
          <div>
            <span>编辑源</span>
            <strong>{story.editorial}</strong>
          </div>
        </div>
        <p className="editor-note">
          <span>编辑判断</span>
          {story.why}
        </p>
        <div className="story-footer">
          <div className="source-pills" aria-label="信息来源">
            {story.sources.map((source) => (
              <span key={source}>{source}</span>
            ))}
          </div>
          <a href={story.link} target="_blank" rel="noreferrer">
            {story.linkLabel} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [edition, setEdition] = useState<"morning" | "evening">("morning");
  const [category, setCategory] = useState<(typeof filters)[number]>("全部");
  const [strongOnly, setStrongOnly] = useState(false);

  const visibleStories = useMemo(
    () =>
      stories.filter((story) => {
        const categoryMatch = category === "全部" || story.category === category;
        const heatMatch = !strongOnly || story.heat >= 4;
        return categoryMatch && heatMatch;
      }),
    [category, strongOnly],
  );

  const spotlight = stories[0];

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AI 风向标首页">
          <span className="brand-mark">AI</span>
          <span>
            <strong>风向标</strong>
            <small>HOT SIGNALS</small>
          </span>
        </a>
        <nav aria-label="页面导航">
          <a href="#briefing">热点</a>
          <a href="#radar">来源雷达</a>
          <a href="#method">研判方法</a>
        </nav>
        <div className="live-status">
          <span /> 自动更新中
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">2026.07.26 · 周日 · 上海</p>
          <h1>
            不是更多新闻，
            <br />
            是更早看见<span>风向。</span>
          </h1>
          <p className="hero-deck">
            25 个编辑源负责发现，社区讨论负责验证。每天 08:00 与 20:00，
            把分散信号压缩成真正值得关注的 AI 议题。
          </p>
          <div className="edition-switch" aria-label="选择简报场次">
            <button
              type="button"
              className={edition === "morning" ? "selected" : ""}
              aria-pressed={edition === "morning"}
              onClick={() => setEdition("morning")}
            >
              <span>08:00</span>
              上午简报
              <small>已发布</small>
            </button>
            <button
              type="button"
              className={edition === "evening" ? "selected" : ""}
              aria-pressed={edition === "evening"}
              onClick={() => setEdition("evening")}
            >
              <span>20:00</span>
              晚间简报
              <small>跟踪中</small>
            </button>
          </div>
        </div>

        <aside className="hero-signal" aria-label="今日头号热点">
          <div className="signal-topline">
            <span>NO. 1 SIGNAL</span>
            <span>过去 12 小时</span>
          </div>
          <div className="signal-score">
            <strong>96</strong>
            <span>/100</span>
            <div className="signal-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <p className="signal-label">综合信号强度</p>
          <h2>{spotlight.title}</h2>
          <p>{spotlight.community}</p>
          <a href="#briefing">进入完整简报 <span>↓</span></a>
        </aside>
      </section>

      <section className="pulse-strip" aria-label="本轮信号概览">
        <div><strong>190</strong><span>抓取条目</span></div>
        <div><strong>09</strong><span>有效候选</span></div>
        <div><strong>04</strong><span>合并议题</span></div>
        <div><strong>00</strong><span>来源错误</span></div>
        <p><span /> WINDOW 20:00 → 08:00</p>
      </section>

      <section className="briefing-section" id="briefing">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {edition === "morning" ? "MORNING BRIEFING" : "EVENING WATCH"}
            </p>
            <h2>{edition === "morning" ? "今早，四个判断" : "今晚，三个追踪点"}</h2>
          </div>
          <p>
            {edition === "morning"
              ? "同一事件跨来源合并，热度由社区互动、来源权重和时效共同决定。"
              : "20:00 将重新抓取白名单与社区信号，只报告有实质变化的议题。"}
          </p>
        </div>

        {edition === "morning" ? (
          <>
            <div className="filter-row" aria-label="筛选热点">
              <div className="filter-pills">
                {filters.map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={category === filter ? "active" : ""}
                    aria-pressed={category === filter}
                    onClick={() => setCategory(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={`strong-toggle ${strongOnly ? "active" : ""}`}
                aria-pressed={strongOnly}
                onClick={() => setStrongOnly((value) => !value)}
              >
                <span /> 只看强热点
              </button>
            </div>

            <div className="story-list">
              {visibleStories.length ? (
                visibleStories.map((story) => <StoryCard key={story.id} story={story} />)
              ) : (
                <div className="empty-state">当前筛选条件下没有热点。</div>
              )}
            </div>
          </>
        ) : (
          <div className="watch-panel">
            <div className="watch-intro">
              <span className="watch-orbit" aria-hidden="true"><i /></span>
              <p className="eyebrow">NEXT EDITION</p>
              <h3>距离晚间简报还有一个观察周期</h3>
              <p>系统不会重复上午内容，只在热度、事实或社区态度发生变化时更新。</p>
            </div>
            <div className="watch-list">
              {watchItems.map((item) => (
                <div key={item.time}>
                  <time>{item.time}</time>
                  <span />
                  <section>
                    <h4>{item.title}</h4>
                    <p>{item.note}</p>
                  </section>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="radar-section" id="radar">
        <div className="radar-copy">
          <p className="eyebrow">SOURCE RADAR</p>
          <h2>编辑源负责发现，<br />社区源负责验真。</h2>
          <p>
            单篇报道只能说明“发生了什么”。跨平台互动能进一步回答：谁在讨论、
            讨论有多深，以及它是一次发布还是正在形成的趋势。
          </p>
          <div className="method-tags" id="method">
            <span>跨来源去重</span>
            <span>12 小时窗口</span>
            <span>社区参与度</span>
            <span>人工角度判断</span>
          </div>
        </div>
        <div className="coverage-card">
          <div className="coverage-head">
            <span>本轮覆盖</span>
            <strong>7 / 11</strong>
          </div>
          {[
            ["25 站白名单", "100%", "full"],
            ["Reddit", "100%", "full"],
            ["Hacker News", "100%", "full"],
            ["GitHub", "86%", "wide"],
            ["Polymarket", "72%", "medium"],
            ["X / YouTube", "待接入", "empty"],
          ].map(([name, value, size]) => (
            <div className="coverage-row" key={name}>
              <div><span>{name}</span><strong>{value}</strong></div>
              <div className="coverage-track"><i className={size} /></div>
            </div>
          ))}
          <p>下一次刷新：今天 20:00</p>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">AI</span>
          <span><strong>风向标</strong><small>HOT SIGNALS</small></span>
        </div>
        <p>每天两次，把噪音留在外面。</p>
        <span>08:00 · 20:00 · ASIA/SHANGHAI</span>
      </footer>
    </main>
  );
}
