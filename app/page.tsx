"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Category = "模型" | "开放生态" | "基础设施" | "社会情绪";

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
          <a href="#briefing">今日热点</a>
          <a href="#radar">信号袋</a>
          <a href="#method">怎么挑的</a>
        </nav>
        <div className="live-status"><span /> 风酱巡逻中</div>
      </header>

      <section className="hero" id="top">
        <span className="hero-tape hero-tape-left" aria-hidden="true" />
        <span className="hero-tape hero-tape-right" aria-hidden="true" />
        <Image
          className="hero-art"
          src="/og.png"
          alt="AI 风向标动漫角色风酱，在云朵与信号波之间捕捉热点"
          width={1672}
          height={941}
          priority
        />
      </section>

      <section className="welcome-strip" aria-label="今日简报介绍">
        <div className="welcome-avatar" aria-hidden="true">✦</div>
        <div className="welcome-copy">
          <span>风酱说</span>
          <h1>早安呀，今天的 AI 圈在聊什么？</h1>
          <p>我从 25 个网站和社区里，替你捞出真正值得看的热点。少一点噪音，多一点有用的判断。</p>
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
            <small>早安刊 · 已发布</small>
          </button>
          <button
            type="button"
            className={edition === "evening" ? "selected" : ""}
            aria-pressed={edition === "evening"}
            onClick={() => setEdition("evening")}
          >
            <span aria-hidden="true">🌙</span>
            <strong>20:00</strong>
            <small>晚安刊 · 跟踪中</small>
          </button>
        </div>
      </section>

      <section className="briefing-section" id="briefing">
        <div className="section-heading">
          <div>
            <p className="kicker">TODAY&apos;S PICKS <span>♡</span></p>
            <h2>{edition === "morning" ? "风酱捞到的 4 个热点" : "今晚要继续蹲的 3 件事"}</h2>
          </div>
          <p>
            {edition === "morning"
              ? "不是转贴新闻：同一事件会跨来源合并，再用社区里的真实讨论来验热度。"
              : "20:00 会重新抓取信息源，只记录热度、事实或社区态度真的发生变化的议题。"}
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

      <section className="radar-section" id="radar">
        <div className="radar-copy">
          <p className="kicker">FUKA&apos;S SIGNAL BAG <span>✦</span></p>
          <h2>风酱的信号袋，<br />今天装了些什么？</h2>
          <p>
            25 个编辑源帮我发现线索，Reddit、Hacker News 和 GitHub
            帮我确认大家是不是真的在意。看到的不是一篇孤零零的报道，而是一阵正在形成的风。
          </p>
          <div className="method-tags" id="method">
            <span>🧷 跨来源去重</span>
            <span>⏰ 12 小时窗口</span>
            <span>💬 社区参与度</span>
            <span>✍️ 人工角度判断</span>
          </div>
        </div>

        <div className="coverage-card">
          <span className="card-tape" aria-hidden="true" />
          <div className="coverage-head">
            <div><span>今日信号收集进度</span><small>SIGNAL COLLECTION</small></div>
            <strong>7 / 11</strong>
          </div>
          {[
            ["25 站白名单", "100%", "full", "🌐"],
            ["Reddit", "100%", "full", "💬"],
            ["Hacker News", "100%", "full", "🟠"],
            ["GitHub", "86%", "wide", "🐙"],
            ["Polymarket", "72%", "medium", "🔮"],
            ["X / YouTube", "待接入", "empty", "📡"],
          ].map(([name, value, size, emoji]) => (
            <div className="coverage-row" key={name}>
              <div><span>{emoji} {name}</span><strong>{value}</strong></div>
              <div className="coverage-track"><i className={size} /></div>
            </div>
          ))}
          <p>下一次打开信号袋：今天 20:00</p>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">✦</span>
          <span><strong>AI 风向标</strong><small>风酱的热点手账</small></span>
        </div>
        <p>每天两次，把噪音留在云朵外面。</p>
        <span>08:00 · 20:00 · ASIA/SHANGHAI</span>
      </footer>
    </main>
  );
}
