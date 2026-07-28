"use client";

import { useMemo, useState } from "react";
import briefingArchive from "../data/briefings.json";
import breakingData from "../data/breaking.json";

type Category = "模型" | "开放生态" | "基础设施" | "社会情绪";

type ArchiveTopic = {
  title: string;
  category: Category;
  heat: string;
  signal: string;
  link: string;
  summary?: string;
  why?: string;
  community?: string;
  editorial?: string;
  sources?: string[];
};

type ArchiveIssue = {
  id: string;
  date: string;
  dateLabel: string;
  weekday: string;
  edition: "morning" | "evening";
  publishedAt: string;
  title: string;
  summary: string;
  topics: ArchiveTopic[];
};

const archiveIssues = briefingArchive as ArchiveIssue[];

type BreakingItem = {
  id: string;
  detectedAt: string;
  title: string;
  category: Category;
  heat: "高" | "中";
  signal: "突发热点" | "快速升温" | "重要更新";
  summary: string;
  why: string;
  sourceCount: number;
  sources: string[];
  link: string;
};

type BreakingFeed = {
  updatedAt: string;
  cadenceMinutes: number;
  cooldownHours: number;
  items: BreakingItem[];
};

const breakingFeed = breakingData as BreakingFeed;

type Story = {
  id: string;
  rank: string;
  category: Category;
  emoji: string;
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
  accent: "pink" | "mint" | "yellow" | "blue";
};

const stories: Story[] = [
  {
    id: "opus-5",
    rank: "01",
    category: "模型",
    emoji: "✨",
    state: "超热",
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
    linkLabel: "去看原始信号",
    accent: "pink",
  },
  {
    id: "open-weight",
    rank: "02",
    category: "开放生态",
    emoji: "🌱",
    state: "超热",
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
    linkLabel: "去看争议全貌",
    accent: "mint",
  },
  {
    id: "infrastructure",
    rank: "03",
    category: "基础设施",
    emoji: "⚡",
    state: "升温中",
    title: "AI 数据中心风险，从耗电升级为电网稳定性与隐性债务",
    summary:
      "输电线路故障触发数据中心大规模切换备用电源，另一边，特殊目的载体正在把 AI 基建债务扩散到更广泛的金融体系。",
    why: "算力扩张第一次同时暴露出物理基础设施脆弱性和金融工程风险。",
    heat: 4,
    change: "+42%",
    community: "HN 685 分 · 375 评论",
    editorial: "TechCrunch · Bank of England · Reuters",
    sources: ["HN", "监管", "媒体"],
    link: "https://www.bankofengland.co.uk/financial-stability-report/2026/july-2026",
    linkLabel: "去看风险报告",
    accent: "yellow",
  },
  {
    id: "avoiding-ai",
    rank: "04",
    category: "社会情绪",
    emoji: "☁️",
    state: "悄悄冒头",
    title: "“Avoiding AI”工作坊走红，反 AI 情绪开始产品化",
    summary:
      "图书馆开始教普通人减少对生成式 AI 和大型科技平台的依赖，活动帖传播量远超该机构的日常内容。",
    why: "它还不是全网热点，但可能是消费者反弹从观点走向服务和线下活动的起点。",
    heat: 3,
    change: "+29%",
    community: "Instagram 2,000+ 赞 · 220 次分享",
    editorial: "TechCrunch · Free Library",
    sources: ["Instagram", "媒体", "机构"],
    link: "https://tech.yahoo.com/ai/articles/librarians-hosting-viral-avoiding-ai-160000074.html",
    linkLabel: "去看趋势报道",
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

const filterEmoji: Record<(typeof filters)[number], string> = {
  全部: "🌈",
  模型: "✨",
  开放生态: "🌱",
  基础设施: "⚡",
  社会情绪: "☁️",
};

const categoryAccent: Record<Category, Story["accent"]> = {
  模型: "pink",
  开放生态: "mint",
  基础设施: "yellow",
  社会情绪: "blue",
};

function issueToStories(issue: ArchiveIssue): Story[] {
  return issue.topics.map((topic, index) => {
    const detailedStory = stories.find((story) => story.title === topic.title);
    if (detailedStory) return { ...detailedStory, rank: String(index + 1).padStart(2, "0") };

    const heat = topic.heat === "高" ? 5 : topic.heat === "中" ? 4 : 3;
    return {
      id: `${issue.id}-${index + 1}`,
      rank: String(index + 1).padStart(2, "0"),
      category: topic.category,
      emoji: filterEmoji[topic.category],
      state: topic.signal,
      title: topic.title,
      summary: topic.summary ?? issue.summary,
      why: topic.why ?? "这个信号已经通过多来源合并，值得放进本期观察清单。",
      heat,
      change: topic.heat,
      community: topic.community ?? `${topic.signal} · 热度${topic.heat}`,
      editorial: topic.editorial ?? "点击查看本主题的原始来源",
      sources: topic.sources ?? [topic.category, "原始来源"],
      link: topic.link,
      linkLabel: "去看原始信号",
      accent: categoryAccent[topic.category],
    };
  });
}

const watchItems = [
  {
    time: "12:30",
    title: "Opus 5 长周期任务反馈",
    note: "观察性能回调、限额消耗与 Coding Agent 稳定性",
    emoji: "🧪",
  },
  {
    time: "15:00",
    title: "开放权重联署后续",
    note: "跟进美国政策表态，以及创业公司与头部实验室的分歧",
    emoji: "📝",
  },
  {
    time: "18:30",
    title: "AI 基建风险扩散",
    note: "检查电网事件是否形成更大范围的监管或资本市场讨论",
    emoji: "🔭",
  },
];

function HeatMeter({ value }: { value: number }) {
  return (
    <span className="heat-meter" aria-label={`热度 ${value} 颗心`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} className={index < value ? "active" : ""}>
          {index < value ? "♥" : "♡"}
        </i>
      ))}
    </span>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <article className={`story-card accent-${story.accent}`}>
      <span className="card-tape" aria-hidden="true" />
      <div className="story-topline">
        <span className="story-rank">HOT {story.rank}</span>
        <span className="story-category">
          {story.emoji} {story.category}
        </span>
        <span className="story-state">{story.state}</span>
      </div>
      <h3>{story.title}</h3>
      <p className="story-summary">{story.summary}</p>

      <div className="heat-row">
        <HeatMeter value={story.heat} />
        <span>讨论升温 {story.change}</span>
      </div>

      <div className="signal-note">
        <p>
          <span>💬 社区在聊</span>
          {story.community}
        </p>
        <p>
          <span>📰 编辑线索</span>
          {story.editorial}
        </p>
      </div>

      <div className="mascot-note">
        <span aria-hidden="true">✦</span>
        <p><strong>风酱的判断</strong>{story.why}</p>
      </div>

      <div className="story-footer">
        <div className="source-pills" aria-label="信息来源">
          {story.sources.map((source) => (
            <span key={source}>#{source}</span>
          ))}
        </div>
        <a href={story.link} target="_blank" rel="noreferrer">
          {story.linkLabel} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

function formatShanghaiTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export default function Home() {
  const [edition, setEdition] = useState<"morning" | "evening">(archiveIssues[0].edition);
  const [category, setCategory] = useState<(typeof filters)[number]>("全部");
  const [strongOnly, setStrongOnly] = useState(false);
  const [archiveIssueId, setArchiveIssueId] = useState(archiveIssues[0].id);

  const latestDate = archiveIssues[0].date;
  const currentIssue = archiveIssues.find(
    (issue) => issue.date === latestDate && issue.edition === edition,
  );
  const currentStories = useMemo(
    () => (currentIssue ? issueToStories(currentIssue) : []),
    [currentIssue],
  );

  const visibleStories = useMemo(
    () =>
      currentStories.filter((story) => {
        const categoryMatch = category === "全部" || story.category === category;
        const heatMatch = !strongOnly || story.heat >= 4;
        return categoryMatch && heatMatch;
      }),
    [category, currentStories, strongOnly],
  );

  const selectedArchive =
    archiveIssues.find((issue) => issue.id === archiveIssueId) ?? archiveIssues[0];

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AI 风向标首页">
          <span className="brand-mark">✦</span>
          <span>
            <strong>AI 风向标</strong>
            <small>风酱的热点手账</small>
          </span>
        </a>
        <nav aria-label="页面导航">
          <a href="#live">准实时雷达</a>
          <a href="#briefing">今日热点</a>
          <a href="#archive">历史档案</a>
          <a href="#method">怎么挑的</a>
        </nav>
        <div className="live-status"><span /> 每小时巡逻中</div>
      </header>

      <section className="hero" id="top">
        <span className="hero-tape hero-tape-left" aria-hidden="true" />
        <span className="hero-tape hero-tape-right" aria-hidden="true" />
        <img
          className="hero-art"
          src="/og.png"
          alt="AI 风向标动漫角色风酱，在云朵与信号波之间捕捉热点"
          width={1672}
          height={941}
          decoding="async"
          fetchPriority="high"
        />
      </section>

      <section className="welcome-strip" aria-label="今日简报介绍">
        <div className="welcome-avatar" aria-hidden="true">✦</div>
        <div className="welcome-copy">
          <span>风酱说</span>
          <h1>早安呀，今天的 AI 圈在聊什么？</h1>
          <p>每小时轻扫 25 个网站和社区，达到阈值就立即告诉你；08:00 与 20:00 再整理成完整手账。</p>
        </div>
        <div className="edition-switch" aria-label="选择简报场次">
          <button
            type="button"
            className={edition === "morning" ? "selected" : ""}
            aria-pressed={edition === "morning"}
            onClick={() => setEdition("morning")}
          >
            <span aria-hidden="true">☀️</span>
            <strong>08:00</strong>
            <small>早安刊 · {archiveIssues.some((issue) => issue.date === latestDate && issue.edition === "morning") ? "已发布" : "待发布"}</small>
          </button>
          <button
            type="button"
            className={edition === "evening" ? "selected" : ""}
            aria-pressed={edition === "evening"}
            onClick={() => setEdition("evening")}
          >
            <span aria-hidden="true">🌙</span>
            <strong>20:00</strong>
            <small>晚安刊 · {archiveIssues.some((issue) => issue.date === latestDate && issue.edition === "evening") ? "已发布" : "跟踪中"}</small>
          </button>
        </div>
      </section>

      <section className="live-radar" id="live">
        <div className="live-radar-shell">
          <div className="live-radar-heading">
            <div>
              <p className="kicker">NEAR REAL-TIME RADAR <span>✦</span></p>
              <h2>有大风时，<br />不用等到早晚刊。</h2>
            </div>
            <div className="live-radar-note">
              <span className="live-mode"><i /> 准实时监测中</span>
              <p>
                整点轻扫，命中阈值才启动 last30days 深挖并推送。没有足够证据时，风酱会安静观察，不拿半成品打扰你。
              </p>
            </div>
          </div>

          <div className="live-metrics" aria-label="准实时监测规则">
            <div><span>⏱</span><strong>{`${breakingFeed.cadenceMinutes} 分钟`}</strong><small>轻量扫描一次</small></div>
            <div><span>🔗</span><strong>2+ 来源</strong><small>触发深度核验</small></div>
            <div><span>🫧</span><strong>{`${breakingFeed.cooldownHours} 小时`}</strong><small>同主题去重</small></div>
            <div><span>📒</span><strong>08 / 20</strong><small>完整总结归档</small></div>
          </div>

          {breakingFeed.items.length ? (
            <div className="breaking-grid" aria-live="polite">
              {breakingFeed.items.map((item) => (
                <article className={`breaking-card accent-${categoryAccent[item.category]}`} key={item.id}>
                  <div className="breaking-card-top">
                    <span className="breaking-badge">⚡ {item.signal}</span>
                    <time dateTime={item.detectedAt}>{formatShanghaiTime(item.detectedAt)}</time>
                  </div>
                  <p className="breaking-meta">#{item.category} · {item.sourceCount} 个独立来源 · 热度{item.heat}</p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="breaking-judgement"><strong>风酱速判</strong>{item.why}</div>
                  <footer>
                    <div>{item.sources.map((source) => <span key={source}>#{source}</span>)}</div>
                    <a href={item.link} target="_blank" rel="noreferrer">看原始信号 ↗</a>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="live-empty" aria-live="polite">
              <div className="scanner-orbit" aria-hidden="true"><span>📡</span><i /><b /></div>
              <div>
                <span>ALL QUIET · 安静巡逻中</span>
                <h3>当前没有达到推送阈值的突发热点</h3>
                <p>这不是“没有新闻”，而是暂时没有通过多来源确认或互动跃升门槛的新事件。下一次轻扫会在整点自动进行。</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="briefing-section" id="briefing">
        <div className="section-heading">
          <div>
            <p className="kicker">TODAY&apos;S PICKS <span>♡</span></p>
            <h2>{currentIssue ? `风酱捞到的 ${currentIssue.topics.length} 个热点` : "今晚要继续蹲的 3 件事"}</h2>
          </div>
          <p>
            {currentIssue
              ? `${currentIssue.date} · ${currentIssue.summary}`
              : "20:00 会重新抓取信息源，只记录热度、事实或社区态度真的发生变化的议题。"}
          </p>
        </div>

        {currentIssue ? (
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
                    <span aria-hidden="true">{filterEmoji[filter]}</span> {filter}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={`strong-toggle ${strongOnly ? "active" : ""}`}
                aria-pressed={strongOnly}
                onClick={() => setStrongOnly((value) => !value)}
              >
                <span aria-hidden="true">♥</span> 只看强信号
              </button>
            </div>

            <div className="story-grid">
              {visibleStories.length ? (
                visibleStories.map((story) => <StoryCard key={story.id} story={story} />)
              ) : (
                <div className="empty-state">这只信号袋现在空空的，换个标签看看吧～</div>
              )}
            </div>
          </>
        ) : (
          <div className="watch-panel">
            <div className="watch-intro">
              <span className="moon-sticker" aria-hidden="true">🌙</span>
              <p className="kicker">EVENING WATCH</p>
              <h3>晚安刊还在认真观察中</h3>
              <p>不会把上午的内容再念一遍。只有信号真的变了，风酱才会写进晚间手账。</p>
            </div>
            <div className="watch-list">
              {watchItems.map((item) => (
                <div key={item.time}>
                  <span className="watch-emoji" aria-hidden="true">{item.emoji}</span>
                  <section>
                    <div><time>{item.time}</time><span>观察中</span></div>
                    <h4>{item.title}</h4>
                    <p>{item.note}</p>
                  </section>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="archive-section" id="archive">
        <div className="archive-heading">
          <div>
            <p className="kicker">HOTSPOT ARCHIVE <span>✦</span></p>
            <h2>以前吹过的风，<br />都替你收好啦。</h2>
          </div>
          <div className="archive-stats" aria-label="历史简报统计">
            <div><strong>{archiveIssues.length}</strong><span>已归档简报</span></div>
            <div><strong>{archiveIssues.reduce((sum, issue) => sum + issue.topics.length, 0)}</strong><span>历史热点</span></div>
            <div><strong>永久</strong><span>保留时间</span></div>
          </div>
        </div>

        <div className="archive-browser">
          <div className="issue-list" role="list" aria-label="历史简报列表">
            {archiveIssues.map((issue) => (
              <button
                type="button"
                key={issue.id}
                className={archiveIssueId === issue.id ? "active" : ""}
                aria-pressed={archiveIssueId === issue.id}
                aria-label={`${issue.date} ${issue.edition === "morning" ? "早安刊" : "晚安刊"}，${issue.topics.length} 个热点`}
                onClick={() => setArchiveIssueId(issue.id)}
              >
                <span className="issue-date">{issue.dateLabel}</span>
                <span className="issue-edition">
                  {issue.edition === "morning" ? "☀️ 早安刊" : "🌙 晚安刊"}
                </span>
                <small>{issue.weekday} · {issue.topics.length} 个热点</small>
              </button>
            ))}
          </div>

          <article className="archive-paper" aria-live="polite">
            <span className="archive-clip" aria-hidden="true">♡</span>
            <header>
              <div>
                <span>{selectedArchive.date} · {selectedArchive.publishedAt}</span>
                <strong>{selectedArchive.edition === "morning" ? "MORNING EDITION" : "EVENING EDITION"}</strong>
              </div>
              <span className="archive-count">{selectedArchive.topics.length} PICKS</span>
            </header>
            <h3>{selectedArchive.title}</h3>
            <p className="archive-summary">{selectedArchive.summary}</p>
            <div className="archive-topics">
              {selectedArchive.topics.map((topic, index) => (
                <a href={topic.link} target="_blank" rel="noreferrer" key={`${selectedArchive.id}-${topic.title}`}>
                  <span className="archive-topic-number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="archive-topic-meta">
                      <span>#{topic.category}</span>
                      <span>{topic.heat === "高" ? "♥♥♥" : topic.heat === "中" ? "♥♥♡" : "♥♡♡"}</span>
                      <span>{topic.signal}</span>
                    </div>
                    <h4>{topic.title}</h4>
                  </div>
                  <span className="archive-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
            <footer className="archive-paper-footer">
              <span>风酱的热点手账 · {selectedArchive.dateLabel}</span>
              <span>内容已归档，不会被新简报覆盖</span>
            </footer>
          </article>
        </div>
      </section>

      <section className="radar-section" id="radar">
        <div className="radar-copy">
          <p className="kicker">FUKA&apos;S SIGNAL BAG <span>✦</span></p>
          <h2>风酱的信号袋，<br />今天装了些什么？</h2>
          <p>
            25 个编辑源负责捕捉事实，Reddit、Hacker News 与 Digg 负责发现社区升温。
            只有线索达到门槛，last30days 才会接力深挖，看到的是一阵正在形成的风，而不是一篇孤零零的报道。
          </p>
          <div className="method-tags" id="method">
            <span>⏱ 每小时轻扫</span>
            <span>🚨 2+ 独立来源触发</span>
            <span>🧷 6 小时去重</span>
            <span>📚 08 / 20 完整归档</span>
          </div>
        </div>

        <div className="coverage-card">
          <span className="card-tape" aria-hidden="true" />
          <div className="coverage-head">
            <div><span>准实时采集链路</span><small>SIGNAL COLLECTION</small></div>
            <strong>25 + 3</strong>
          </div>
          {[
            ["25 站白名单", "100%", "full", "🌐"],
            ["Reddit", "100%", "full", "💬"],
            ["Hacker News", "100%", "full", "🟠"],
            ["Digg", "100%", "full", "📰"],
            ["last30days 深挖", "按需触发", "medium", "🔭"],
          ].map(([name, value, size, emoji]) => (
            <div className="coverage-row" key={name}>
              <div><span>{emoji} {name}</span><strong>{value}</strong></div>
              <div className="coverage-track"><i className={size} /></div>
            </div>
          ))}
          <p>下一次轻扫：每个整点 · 深挖只在达到阈值时启动</p>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">✦</span>
          <span><strong>AI 风向标</strong><small>风酱的热点手账</small></span>
        </div>
        <p>每小时巡逻，早晚两次写进手账。</p>
        <span>HOURLY SCAN · 08:00 · 20:00</span>
      </footer>
    </main>
  );
}
