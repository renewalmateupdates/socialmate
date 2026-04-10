-- Blog batch 3: Enki posts (category: Enki)
INSERT INTO blog_posts (slug, title, excerpt, content, category, author, published_at) VALUES

('what-is-enki-trading-bot',
'What Is Enki? The Autonomous Treasury Guardian Explained',
'Enki is an autonomous trading bot that scans 7 signal sources and only executes when confidence hits 6/10. Here is exactly how it works.',
'## The Problem With Manual Trading

Most people who want to invest in stocks and crypto face the same wall: they don''t have time to watch charts, they don''t know how to read technical indicators, and they can''t react fast enough to news-driven moves.

The alternative — handing money to a fund manager or robo-advisor — means fees, minimums, and no transparency into what''s happening with your capital.

Enki is a third option.

## What Enki Is

Enki is an autonomous trading bot built for individual investors. It connects to your brokerage accounts (Alpaca for stocks, Coinbase for crypto), monitors seven signal sources continuously, and executes trades only when enough signals align to push confidence above a 6/10 threshold.

When confidence is below 6/10, Enki waits. No trade happens.

## The Seven Signal Sources

Enki doesn''t trade on one indicator. It synthesizes seven:

1. **Congressional trade disclosures** — Senators and Representatives must report trades within 45 days. When legislators buy, it''s one signal worth tracking.
2. **Reddit and social sentiment** — Retail sentiment from r/wallstreetbets, r/investing, and other communities. Contrarian and momentum signals both.
3. **RSI (Relative Strength Index)** — Classic momentum indicator. Identifies overbought and oversold conditions.
4. **MACD (Moving Average Convergence Divergence)** — Trend-following momentum indicator. Helps identify trend reversals.
5. **Options flow** — Unusual options activity often precedes large moves. Enki tracks it as a leading indicator.
6. **News and earnings calendar** — News sentiment analysis and awareness of upcoming earnings, which Enki''s Fortress Guard avoids.
7. **Sector momentum** — Which sectors are showing strength? Capital flows from weak to strong sectors — Enki tracks this rotation.

## The Fortress Guard

Even when confidence hits 6/10, Fortress Guard rules must pass before any order is placed:

- Minimum trade: $5
- Maximum trade: $2,000 per position
- Maximum 3 trades per day
- Hard stop-loss at -8% per position
- No single asset can exceed 25% of portfolio
- No new positions on FOMC, CPI, or NFP announcement days
- PDT rule enforcement for accounts under $25,000

These rules cannot be overridden. They exist to protect capital before it can grow.

## Paper Trading First

Every Enki user starts as a Citizen — paper trading with simulated capital, all seven signals active, all Fortress Guard rules running. No real money at risk.

Paper trading lets you watch how the guardian makes decisions, how the confidence scoring works, and whether the doctrine you''ve set produces results you trust. Go live when you''re ready — not before.

## The Tiers

- **Citizen ($0):** Paper trading, full signals, 1 active doctrine, 7-day backtests
- **Commander ($15/mo):** Live stock trading via Alpaca, approval mode, 3 doctrines, 30-day backtests
- **Emperor ($29/mo):** Full autonomy, Coinbase crypto, multi-broker, 90-day backtests, Cloud Runner

Start free at socialmate.studio/enki',
'Enki', 'Joshua Bostic', '2026-04-07 09:00:00+00'),

('paper-trading-before-going-live',
'Why You Should Paper Trade Before Risking Real Money (And How to Do It)',
'Paper trading is the most underused tool in a new investor''s arsenal. Here is why it matters and how Enki makes it easy.',
'## The Cost of Learning With Real Money

Most new investors lose money in their first year. Not because the market is rigged against them — because they''re learning an expensive skill with real capital as the tuition.

They buy high because of FOMO. They sell low because of fear. They chase hot stocks from Reddit threads without a risk management framework. Each mistake costs real money.

Paper trading eliminates this cost.

## What Paper Trading Is

Paper trading means executing simulated trades with fake money but real market prices. Your "portfolio" grows or shrinks based on actual market movements, but no real capital is at risk.

It sounds like it would feel fake and therefore be useless. The opposite is true. Paper trading reveals how you actually behave under market conditions — not how you imagine you''d behave.

## What You Learn From Paper Trading

**Whether your strategy works.** A strategy that sounds smart in theory might produce consistent losses in practice. Paper trading shows you before real money is involved.

**Your emotional response to volatility.** Even with fake money, watching a position drop 15% produces a real psychological response. You learn whether you''d panic-sell or hold.

**How to use the tools.** Brokerage interfaces, order types, position sizing — all of this has a learning curve. Make your mistakes on paper.

**What your actual win rate is.** Track every paper trade. What percentage are profitable? What''s your average gain vs average loss? These numbers tell you whether to go live.

## Paper Trading With Enki

Enki''s Citizen tier is a fully functional paper trading environment. All seven signal sources run. All Fortress Guard rules enforce. The confidence threshold (6/10 for buys, 5/10 for sells) applies.

The only difference: no real money moves. Your simulated portfolio tracks exactly as if trades were real.

Enki also shows you the leaderboard — how your paper portfolio ranks against other users by percentage return. This adds accountability without risk.

## When to Go Live

There is no universal answer. General guidelines:

- At least 90 days of paper trading with real attention (not just letting it run and ignoring it)
- A strategy (doctrine) that''s produced consistent results on paper
- Capital you can genuinely afford to lose — if losing it would hurt your life, it''s too much
- Understanding of every Fortress Guard rule and why it exists

Going live with Commander tier adds approval mode — Enki surfaces trade recommendations and you confirm before execution. This is the right first step into live trading.',
'Enki', 'Joshua Bostic', '2026-04-07 10:00:00+00'),

('what-is-algorithmic-trading-beginners',
'Algorithmic Trading for Beginners: What It Is and Whether It''s Right for You',
'Algorithmic trading used to require a finance degree and a Bloomberg terminal. In 2026, it''s accessible to anyone. Here is what you need to know.',
'## Algorithmic Trading Is No Longer Just for Hedge Funds

For decades, algorithmic trading — using software to execute trades based on predefined rules and signals — was the exclusive domain of quantitative hedge funds, investment banks, and prop trading firms. The infrastructure cost millions. The expertise required years of specialized education.

That changed. The combination of commission-free brokerages, open APIs, and AI has made algorithmic trading accessible to individual investors. Tools like Enki bring it to anyone.

## How Algorithmic Trading Works

An algorithm is a set of rules. In trading, those rules define: what to buy, when to buy it, how much to buy, and when to sell.

A simple example: "Buy AAPL when RSI drops below 30, sell when RSI rises above 70." An algorithm can monitor this condition 24 hours a day, 7 days a week, across dozens of assets simultaneously — and execute trades in milliseconds when conditions are met.

More sophisticated algorithms layer multiple signals: technical indicators, news sentiment, options flow, macroeconomic data. The more signals that align, the higher the confidence before the algorithm acts.

## The Advantages of Algorithmic Trading

**No emotion.** Algorithms don''t panic when the market drops. They don''t get greedy when it rises. The rules execute regardless of what financial Twitter is saying.

**Speed.** Relevant for high-frequency trading; less important for retail investors making longer-term position trades.

**Consistency.** A human investor makes different decisions when tired, stressed, or distracted. An algorithm makes the same decision every time conditions are the same.

**Scale.** Monitor more assets than any human can track simultaneously.

## The Risks

**Overfitting.** An algorithm trained on historical data might be optimized for that specific period and fail going forward. This is why backtesting over diverse market conditions matters.

**Technical failures.** Software has bugs. APIs go down. Positions can be stuck.

**Market changes.** A strategy that worked for three years can stop working when market conditions shift.

## Enki''s Approach to Accessible Algorithmic Trading

Enki handles the algorithm layer — seven signal sources, confidence scoring, Fortress Guard risk management — and lets users configure their doctrine (what assets to trade, risk tolerance, position sizing) without needing to write code.

Paper trading lets you run the algorithm on real market data with no real risk. If the results look good over 90 days, you go live with exactly the same rules.

The goal: algorithmic trading accessible to anyone willing to spend the time understanding it — not just those with a quant finance degree.',
'Enki', 'Joshua Bostic', '2026-04-07 11:00:00+00'),

('congressional-trading-disclosures-explained',
'Congressional Trading Disclosures: What They Are and How Enki Uses Them',
'Members of Congress must report their stock trades. That data is public and it''s one of the signals Enki watches.',
'## What the STOCK Act Requires

The Stop Trading on Congressional Knowledge Act (STOCK Act), passed in 2012, requires members of Congress and senior government officials to disclose stock trades within 45 days of the transaction. The disclosures are public — anyone can see them.

The data includes: who traded, what they traded (stock or option), whether it was a buy or sell, the approximate size of the transaction, and the date.

## Why This Data Is Interesting

Congress members have access to information before the public. They sit on committees that regulate industries. They receive classified briefings. They vote on legislation that moves markets.

Whether they trade on non-public information is illegal under the STOCK Act, but enforcement has been limited. The academic research on congressional trading shows consistent outperformance versus market benchmarks — particularly in sectors regulated by the committees members sit on.

This doesn''t mean copying every congressional trade is a good strategy. Many disclosures are delayed 45 days, which is a long lag in fast-moving markets. Many trades are routine financial planning, not information-driven.

But the data is a signal worth incorporating.

## How Enki Uses Congressional Disclosure Data

Enki monitors public disclosure filings and uses congressional trades as one of seven signals in its confidence scoring model. A congressional buy in a specific sector or company adds a small confidence boost — not enough to trigger a trade on its own, but meaningful when combined with technical indicators showing the same direction.

Similarly, congressional sells in a position Enki holds can contribute to a sell signal.

The weight given to this signal is calibrated against historical performance. It''s a supporting signal, not the primary trigger.

## The Data Sources

Congressional disclosure data is available from:
- House Clerk financial disclosures (clerk.house.gov)
- Senate financial disclosures (efts.senate.gov)
- Third-party aggregators like Capitol Trades and Quiver Quantitative

These sources are public and updated as disclosures are filed.

## Important Context

Congressional trading is a signal, not a guarantee. Disclosures are delayed up to 45 days — a lot can happen in that window. Some members make dozens of trades that look random. Others make concentrated bets that appear more deliberate.

Enki treats this as one data point among seven. No single signal drives a trade. All seven must align to push confidence above the 6/10 execution threshold.',
'Enki', 'Joshua Bostic', '2026-04-08 09:00:00+00'),

('enki-vs-3commas-vs-cryptohopper',
'Enki vs 3Commas vs Cryptohopper: Which Automated Trading Bot Is Right for You?',
'Three automated trading bots, three different approaches. Here is an honest comparison to help you choose.',
'## The Automated Trading Bot Market in 2026

The automated trading bot market is crowded and often confusing. Tools range from simple DCA (dollar-cost averaging) bots to sophisticated multi-signal algorithmic systems. Prices range from free to $500+/month.

Here is an honest comparison of three major options.

## 3Commas

**Starting price:** $14.99/month (Basic), $24.99/month (Advanced), $49.99/month (Pro)
**Asset focus:** Crypto-first (50+ exchanges supported), limited stock support
**Approach:** Pre-built bot templates (DCA, GRID, Options), signal marketplace, copy trading

**Strengths:** Massive exchange support, established platform with large community, good DCA bot implementation, copy trading lets you follow successful traders.

**Weaknesses:** Crypto-focused (minimal stock support), confusing pricing tiers, signal marketplace quality varies widely, overwhelming for beginners.

**Best for:** Experienced crypto traders who want DCA or GRID bots across multiple exchanges.

## Cryptohopper

**Starting price:** $19/month (Explorer), $49/month (Adventure), $99/month (Hero)
**Asset focus:** Crypto only (100+ exchanges)
**Approach:** Technical indicator-based bots, strategy marketplace, AI features on higher tiers

**Strengths:** Extensive technical indicator library, large strategy marketplace, paper trading available, active community.

**Weaknesses:** Crypto only — no stocks. Expensive for full features. Strategy quality in the marketplace varies significantly. Learning curve is steep.

**Best for:** Crypto traders who want technical analysis automation and are willing to invest time in configuration.

## Enki

**Starting price:** $0 (Citizen, paper trading), $15/month (Commander, live stocks), $29/month (Emperor, stocks + crypto)
**Asset focus:** Stocks via Alpaca + Crypto via Coinbase
**Approach:** 7-signal confidence scoring, Fortress Guard risk management, doctrine-based configuration

**Strengths:** Stocks AND crypto (competitors are crypto-only or crypto-first). Free paper trading tier. Strong risk management built in (cannot be disabled). Simpler than competitors — you set a doctrine, the guardian runs it. Lower price than 3Commas or Cryptohopper for comparable live trading features.

**Weaknesses:** Newer platform (currently in early access). Fewer exchanges than 3Commas or Cryptohopper. Community and marketplace still growing.

**Best for:** Individual investors who want algorithmic trading across both stocks and crypto without needing a deep technical background.

## Side-by-Side Comparison

| Feature | 3Commas | Cryptohopper | Enki |
|---|---|---|---|
| Stocks | Limited | No | Yes (Alpaca) |
| Crypto | Yes (50+ exchanges) | Yes (100+ exchanges) | Yes (Coinbase) |
| Free tier | No | No | Yes (paper trading) |
| Entry price (live trading) | $14.99/mo | $19/mo | $15/mo |
| Risk management | Manual | Manual | Built-in (Fortress Guard) |
| Signal sources | Technical indicators | Technical indicators | 7 sources incl. congressional, sentiment |
| Paper trading | Yes | Yes | Yes |

## The Bottom Line

If you''re crypto-only across many exchanges: 3Commas or Cryptohopper.
If you want stocks and crypto together with built-in risk management: Enki.
If you want to start completely free: Enki''s Citizen tier is the only option with no cost.

Start free at socialmate.studio/enki',
'Enki', 'Joshua Bostic', '2026-04-08 10:00:00+00'),

('fortress-guard-trading-risk-management',
'Fortress Guard: How Enki Protects Your Capital Before It Can Grow',
'Every trade Enki makes must pass 7 non-negotiable risk rules. Here is exactly what those rules are and why they exist.',
'## The Biggest Mistake New Algorithmic Traders Make

The most common failure mode for new algorithmic traders isn''t a bad strategy. It''s inadequate risk management.

A strategy with a 60% win rate can still blow up an account if the 40% of losing trades are large enough. Without hard rules — position limits, stop-losses, daily drawdown caps — a few bad days can erase months of gains.

Enki''s Fortress Guard is the answer to this problem. It''s a set of seven non-negotiable rules that run before every single order, at every confidence level, for every user. They cannot be overridden on Citizen or Commander. They are always on.

## The Seven Fortress Guard Rules

**1. Minimum trade size: $5**
Enki won''t execute a trade smaller than $5. This prevents the overhead of managing dozens of tiny positions.

**2. Maximum trade size: $2,000**
No single position can exceed $2,000 in value at entry. This caps the damage any single bad trade can do.

**3. Maximum 3 trades per day**
Overtrading is one of the most common ways algorithmic traders lose money. High trade frequency means more commissions, more slippage, and more opportunities for the algorithm to make mistakes. Three trades per day is the hard cap.

**4. Hard stop-loss at -8%**
If any position drops 8% below entry price, Enki sells it automatically. No exceptions. This prevents small losses from becoming catastrophic ones.

**5. Maximum 25% of portfolio in one asset**
Concentration risk kills portfolios. No single stock or cryptocurrency can represent more than 25% of the total portfolio value.

**6. Sector concentration cap: 40%**
No more than 40% of the stock portfolio can be in one sector. If tech is up and Enki wants to buy five tech stocks, Fortress Guard limits the exposure.

**7. Macro event shield**
No new positions are opened on days with major economic announcements: FOMC rate decisions, CPI (inflation) reports, and NFP (jobs) reports. These events cause extreme volatility that makes normal signal readings unreliable.

## Additional Protections

**PDT rule enforcement:** Accounts under $25,000 are limited to 3 day trades in a 5-day rolling window under FINRA''s Pattern Day Trader rule. Enki tracks this automatically and won''t exceed it.

**Earnings calendar guard:** Enki avoids buying positions within 2 days of a company''s earnings announcement, eliminating the most common source of volatility traps.

**3 consecutive loss brake:** Three losing trades in a row triggers a mandatory pause for human review before the guardian resumes.

**Crypto treasury cap:** Cryptocurrency is hard-capped at 35% of total portfolio value.

## Why These Rules Are Non-Negotiable

Risk management rules are only useful if they''re always on. A rule you can override is a rule you''ll override at exactly the wrong moment — when fear or greed is highest.

The Fortress Guard runs before every order. It doesn''t have emotions. It doesn''t make exceptions. That consistency is the point.',
'Enki', 'Joshua Bostic', '2026-04-08 11:00:00+00'),

('how-to-start-investing-algorithmically',
'How to Start Algorithmic Investing With No Coding Experience',
'You don''t need to know Python or build your own trading algorithm. Here is how to get started with autonomous investing today.',
'## Algorithmic Investing Without Code

The traditional path to algorithmic trading required: a computer science or finance degree, programming skills (Python, R, or C++), access to market data APIs, brokerage API integration, and a thorough understanding of statistical modeling.

This path is still valid. It''s also completely unnecessary for most individual investors who want to benefit from algorithmic trading.

The tools have changed. You can now run a sophisticated multi-signal trading algorithm without writing a single line of code.

## The New Path: Configure, Don''t Code

Tools like Enki separate the algorithm (the trading logic) from the configuration (what you want it to trade). You configure a doctrine — which assets to trade, risk parameters, position sizing preference — and the algorithm handles the execution.

This is analogous to how you don''t need to understand how a GPS works to use it for navigation. You enter the destination; it handles the route.

## Step 1: Start With Paper Trading

Before any real money is involved, run the algorithm on simulated capital. Enki''s Citizen tier is free — you can watch the guardian make decisions, see the confidence scores, and understand how the signal sources combine.

Spend 60–90 days in paper trading mode. Watch what it does. Read the reasoning behind each trade signal. Ask whether you understand and agree with the approach before going live.

## Step 2: Set Your Doctrine

A doctrine is your trading strategy configuration:
- Which assets to monitor (specific stocks, ETFs, or crypto)
- Your risk tolerance (conservative, moderate, aggressive position sizing)
- Which signal sources to weight more heavily
- Your profit target and stop-loss preferences (Fortress Guard handles the hard limits)

Enki''s strategy vault includes pre-built doctrines for different goals — growth-focused, income-focused, crypto-focused — as starting points.

## Step 3: Review Backtests

Before paper trading live, run a backtest on your doctrine. A backtest applies your strategy rules to historical market data and shows how the doctrine would have performed.

Key metrics to evaluate:
- Win rate (what % of trades were profitable)
- Average gain vs average loss
- Maximum drawdown (worst peak-to-trough drop)
- Sharpe ratio (risk-adjusted returns)

A good backtest doesn''t guarantee future performance. But a doctrine that fails in backtesting is unlikely to succeed in live trading.

## Step 4: Go Live in Approval Mode

Enki''s Commander tier includes approval mode: the guardian identifies trades and surfaces them to you before executing. You confirm or skip. This is the right bridge between paper trading and full autonomy — you see every trade before it happens, you learn the pattern, and you build confidence.

## Step 5: Move to Autonomy When Ready

Emperor tier enables fully autonomous mode. The guardian executes without waiting for approval. Fortress Guard runs on every order. You review results daily rather than approving each trade.

Most users spend 3–6 months in approval mode before switching to autonomous.',
'Enki', 'Joshua Bostic', '2026-04-09 09:00:00+00'),

('reddit-sentiment-stock-trading-signals',
'How Reddit Sentiment Became a Legitimate Stock Market Signal',
'After GameStop, Wall Street started paying attention to retail sentiment. Here is how it works as a trading signal in 2026.',
'## The GameStop Moment Changed Everything

In January 2021, retail investors coordinating on Reddit''s r/wallstreetbets drove GameStop (GME) from $20 to $483 in a matter of days. Short sellers lost billions. Hedge funds got caught off-guard. And institutional traders started paying attention to a signal they''d previously dismissed: retail social sentiment.

Five years later, Reddit sentiment is a standard input in many quantitative trading systems.

## Why Sentiment Is a Signal

Markets are not purely rational. Price moves are driven by human behavior — emotion, narrative, and momentum as much as fundamentals. When a large number of retail investors simultaneously believe a stock is going to move, their collective buying or selling creates the very move they predicted.

Sentiment analysis tries to measure this: how positive or negative is the collective conversation about a specific stock, and is that sentiment increasing or decreasing?

Rising positive sentiment + increasing mention volume is a momentum signal. Extreme sentiment in one direction can also be a contrarian signal — when everyone is maximally bullish, there may be nobody left to buy.

## How Sentiment Data Is Collected

Sentiment analysis tools scan Reddit posts and comments (particularly r/wallstreetbets, r/investing, r/stocks, r/cryptocurrency), Twitter/X posts, StockTwits, and other social platforms. Natural language processing (NLP) models classify each mention as positive, negative, or neutral and score the intensity.

The output is a sentiment score for each asset — updated continuously.

## How Enki Uses Reddit Sentiment

Social sentiment is one of Enki''s seven signal sources. When Reddit sentiment for an asset Enki monitors is trending positive (increasing mentions, increasingly positive language), it contributes to the confidence score for a potential buy.

When sentiment is deteriorating — increasing negative mentions, declining enthusiasm — it contributes to sell signals.

Importantly, sentiment alone never triggers a trade. The 6/10 confidence threshold requires multiple signals to align. Retail euphoria on Reddit is interesting; retail euphoria plus positive RSI plus unusual options flow starts becoming actionable.

## The Limits of Sentiment

**Manipulation.** Coordinated pump-and-dump schemes use social media to create artificial sentiment. Enki''s multi-signal requirement provides some protection — manufactured sentiment without technical confirmation is less likely to cross the threshold.

**Lag.** By the time a stock is trending on Reddit, some of the move may have already happened.

**Noise.** Most Reddit discussion is noise. Volume and trend matter more than any single post.',
'Enki', 'Joshua Bostic', '2026-04-09 10:00:00+00'),

('enki-leaderboard-explained',
'The Enki Leaderboard: How Architects Are Ranked (and Why Dollar Amounts Are Never Shown)',
'Enki''s public leaderboard shows who is performing best — but never how much money they have. Here is why.',
'## The Privacy-First Leaderboard

Most trading performance leaderboards show absolute numbers: total portfolio value, dollar gains, account size. This creates problems. It reveals financial information people may not want public. It advantages users with large accounts — a $100,000 portfolio gaining $10,000 looks more impressive than a $5,000 portfolio gaining $1,000, even though the second investor is performing better on a percentage basis.

Enki''s leaderboard shows only percentage return. Dollar amounts are never displayed, anywhere, for any user.

## Why Percentage Return Is the Right Metric

Percentage return is the only fair way to compare investors across different account sizes. A 20% return means the same thing whether it came from a $1,000 account or a $100,000 account — the strategy worked with that level of efficiency.

Dollar-amount leaderboards don''t measure skill. They measure how much capital someone started with.

## What the Leaderboard Shows

For each Architect (Enki user) who opts into the leaderboard:

- **Username or alias** (not real name)
- **Tier badge** (Citizen, Commander, or Emperor)
- **Live vs paper indicator** (paper traders are clearly marked)
- **% return** (the only financial metric)
- **Win rate** — what percentage of trades are profitable
- **Conquest streak** — consecutive days with positive returns
- **Doctrine rank** — a stylized title based on performance consistency

## What It Never Shows

- Account balance
- Dollar gains or losses
- Position sizes
- Which specific stocks or crypto they hold

This is intentional. The leaderboard exists to create healthy competition and accountability, not to expose people''s financial situations.

## The Paper Trading Badge

Paper traders are clearly identified with a "Paper" badge. This matters because paper trading results are not directly comparable to live trading — there''s no slippage, no emotional pressure, and unlimited simulated capital.

Paper performance is still worth tracking. It validates doctrine quality before going live. But the distinction between paper and live is always visible.

## How to Join the Leaderboard

Leaderboard visibility is opt-in. By default, your account is private. To appear on the leaderboard, go to Enki Settings and enable leaderboard visibility.',
'Enki', 'Joshua Bostic', '2026-04-09 11:00:00+00'),

('stocks-vs-crypto-algorithmic-trading',
'Stocks vs Crypto for Algorithmic Trading: Which Should You Start With?',
'Two very different asset classes. Two very different risk profiles. Here is how to think about which to trade algorithmically first.',
'## The Fundamental Difference

Stocks and crypto share some surface-level similarities — they both trade on exchanges, both move based on supply and demand, both can be analyzed with technical indicators. The similarities end there.

The differences matter enormously for algorithmic trading.

## Market Hours

**Stocks:** Trade 9:30am–4:00pm ET, Monday–Friday. Pre-market (4am–9:30am) and after-hours (4pm–8pm) have lower liquidity.

**Crypto:** 24/7/365. No closes, no weekends, no holidays. A major price move at 3am Sunday is entirely normal.

This affects algorithms differently. A stock trading algorithm can be simpler about time — it only needs to monitor during market hours. A crypto algorithm must be always-on, which is why Enki''s Cloud Runner add-on matters more for crypto traders.

## Volatility

Crypto is significantly more volatile than equities. A 10% daily move in a stock is news. A 10% daily move in a cryptocurrency is Tuesday.

Higher volatility means:
- More trading opportunities
- Larger potential gains
- Larger potential losses
- More false signals from technical indicators

Fortress Guard''s -8% stop-loss matters more in crypto. Positions can reach that threshold within hours.

## Regulation and Maturity

Stock markets are heavily regulated. Companies file mandatory disclosures. Trading practices are scrutinized. Market manipulation is illegal and prosecuted.

Crypto regulation is still evolving. Wash trading exists on some exchanges. Rug pulls are a real risk in small-cap tokens. Stick to major assets (BTC, ETH, SOL) until you understand the landscape.

## Which to Start With Algorithmically

**Start with stocks if:**
- You want a more regulated, predictable environment
- You prefer defined trading hours
- You''re new to investing generally
- You have under $25,000 (be aware of PDT rules)

**Start with crypto if:**
- You''re comfortable with high volatility
- You want 24/7 market access
- You already understand how crypto exchanges work
- You''re starting with a small amount you can afford to lose

## Enki''s Approach

Enki handles both — stocks via Alpaca and crypto via Coinbase. Commander tier covers stocks. Emperor tier adds crypto. You can start with stocks on Commander, learn the system, and add crypto via Emperor when you''re ready.

The risk management layer (Fortress Guard) applies equally to both asset classes. The same principles — position limits, stop-losses, confidence thresholds — protect capital whether you''re trading AAPL or BTC.',
'Enki', 'Joshua Bostic', '2026-04-10 09:00:00+00'),

('pdt-rule-explained-how-to-avoid',
'The PDT Rule Explained: What It Is and How Enki Handles It Automatically',
'The Pattern Day Trader rule confuses most new stock traders. Violating it locks your account. Here is exactly how it works and how Enki tracks it for you.',
'## What the PDT Rule Is

The Pattern Day Trader (PDT) rule is a FINRA regulation that applies to margin accounts in the United States. It states:

If you execute 4 or more day trades (buying and selling the same security within the same trading day) in a 5-business-day rolling window, and those day trades represent more than 6% of your total trading activity in that period, you are classified as a Pattern Day Trader.

Once classified as a PDT, you must maintain a minimum of $25,000 in your margin account at all times. If your account falls below $25,000, you cannot execute any day trades until the balance is restored.

## Why This Matters for Algorithmic Trading

Algorithmic trading can generate day trades quickly — faster than a human would typically notice. Without tracking, an algorithm could trigger PDT classification without the user realizing it.

Once PDT-classified with under $25,000 in the account, the brokerage restricts day trading. This can cause the algorithm to fail to exit positions it needs to exit, leading to losses.

## How Enki Handles PDT

Enki''s Fortress Guard includes automatic PDT rule enforcement:

- For accounts under $25,000, Enki tracks day trades against the 5-business-day rolling window
- When approaching the 3-day-trade limit (staying one trade short of triggering PDT classification), Enki pauses new day trade entries
- Enki prefers swing trades (holding overnight) over day trades when PDT headroom is limited
- The dashboard shows your current PDT counter so you always know where you stand

This is handled automatically. You don''t need to track it manually or worry about accidentally triggering the rule.

## Getting Around the PDT Rule (Legitimately)

**Option 1:** Fund the account above $25,000. Above this threshold, the PDT rule doesn''t restrict trading.

**Option 2:** Use a cash account instead of a margin account. Cash accounts aren''t subject to PDT rules, but trades require settled funds (typically 2 business days to settle after a sale).

**Option 3:** Be strategic about when you close positions. Closing at the end of a day vs. the following day is the difference between a day trade and a swing trade.

Enki''s position management defaults to swing trading strategies that minimize PDT exposure while maximizing opportunities.',
'Enki', 'Joshua Bostic', '2026-04-10 10:00:00+00'),

('enki-cloud-runner-explained',
'What Is Enki''s Cloud Runner and Do You Need It?',
'The Cloud Runner keeps your trading guardian running 24/7 — even when your laptop is off. Here is what it does and whether it''s worth the $7/month.',
'## The Problem With Desktop-Dependent Bots

Traditional trading bots run on your computer. When your computer is off — you''re asleep, you''re at work, your laptop battery died — the bot stops running. Opportunities pass. Stop-losses don''t execute. Positions sit unmonitored.

For stock trading with defined market hours, this is partially manageable. For crypto trading that runs 24/7, it''s a significant problem.

## What Cloud Runner Is

Cloud Runner is an add-on for Enki Commander and Emperor tier users that keeps your trading guardian running on Enki''s cloud infrastructure around the clock — regardless of whether your device is on or connected.

Instead of your laptop running the bot, Enki''s servers run it. Your guardian monitors signals, evaluates confidence, and (in autonomous mode) executes trades whether you''re sleeping, working, or on a flight with no WiFi.

## What Cloud Runner Costs

Cloud Runner is $7/month, available as an add-on to Commander ($15/mo) or Emperor ($29/mo). Total cost: $22/month or $36/month respectively.

For context: if you''re running crypto strategies that need 24/7 monitoring, Cloud Runner pays for itself if it catches even one overnight move that your laptop-off bot would have missed.

## Do You Need It?

**You need Cloud Runner if:**
- You''re trading crypto (24/7 market, can move significantly overnight)
- You run autonomous mode and don''t want to manually confirm trades during work hours
- You travel frequently or have inconsistent laptop usage
- You want true set-it-and-forget-it operation

**You can skip Cloud Runner if:**
- You''re only trading stocks (market closes at 4pm ET, 8pm ET for after-hours)
- You''re in approval mode and actively reviewing trades during the day anyway
- You''re still in paper trading (Citizen tier) — Cloud Runner isn''t needed for simulation

## Cloud Runner vs Running Your Own Server

Technical users might consider running Enki on a VPS (virtual private server) — services like DigitalOcean or Linode offer VPS for $4–$6/month. This is a valid option if you''re comfortable with server management.

The trade-off: a self-hosted VPS requires setup, maintenance, monitoring, and troubleshooting. Cloud Runner is managed by Enki — updates, uptime monitoring, and infrastructure management are handled for you.

For most users, the $7/month is worth not having to manage a server.',
'Enki', 'Joshua Bostic', '2026-04-10 11:00:00+00'),

('enki-vs-wealthfront-vs-betterment',
'Enki vs Wealthfront vs Betterment: Robo-Advisor or Autonomous Bot?',
'Robo-advisors and autonomous trading bots both automate investing — but they do fundamentally different things. Here is how to choose.',
'## Two Different Philosophies

Wealthfront and Betterment are robo-advisors. Enki is an autonomous trading bot. Both automate investing, but the philosophy, approach, and target user are completely different.

Understanding the difference helps you choose the right tool for your situation.

## What Robo-Advisors Do

Wealthfront, Betterment, and similar services manage a diversified portfolio of ETFs based on your risk tolerance and time horizon. You answer a questionnaire, they allocate your money across stocks, bonds, and sometimes alternative assets, and they rebalance periodically.

**The strengths:**
- Truly passive — you set it and forget it for years
- Well-diversified by default
- Tax-loss harvesting on higher tiers
- Low fees (0.25% annually is typical)
- Regulated as investment advisors (fiduciary in some cases)
- Proven track record across market cycles

**The limits:**
- No active trading — you capture market returns, not outperformance
- No customization beyond risk level (conservative/moderate/aggressive)
- Can''t respond quickly to specific opportunities
- Returns track the market by design

## What Enki Does

Enki actively trades individual stocks and crypto assets based on multi-signal confidence scoring. It''s not trying to match the market — it''s trying to outperform it by identifying specific entry and exit points.

**The strengths:**
- Active management with algorithmic precision
- Responds to specific signals (congressional trades, RSI, sentiment)
- Covers stocks AND crypto in one platform
- Fortress Guard provides hard risk management
- Fully transparent — you can see every signal and trade

**The limits:**
- Active trading involves more risk than passive index investing
- Requires engagement (especially in approval mode)
- No fiduciary duty — Enki is a tool, not an advisor
- Newer, less proven track record than established robo-advisors

## Which Is Right for You?

**Choose a robo-advisor (Wealthfront/Betterment) if:**
- You want completely passive, long-term wealth building
- You''re saving for retirement and won''t touch the money for 10+ years
- You want professional-grade diversification with minimal effort
- You''re risk-averse and want market returns

**Choose Enki if:**
- You want active algorithmic trading across stocks and crypto
- You''re comfortable with higher risk for potentially higher returns
- You want transparency into every trading decision
- You want to learn how algorithmic trading works

## The Both/And Answer

These aren''t mutually exclusive. Many investors use robo-advisors for their core long-term retirement savings and use Enki with a separate, smaller allocation for active algorithmic trading.

The critical rule: never trade with money you can''t afford to lose. Keep your retirement savings in passive, diversified vehicles. Use Enki with your active trading allocation.',
'Enki', 'Joshua Bostic', '2026-04-10 12:00:00+00')

ON CONFLICT (slug) DO NOTHING;
