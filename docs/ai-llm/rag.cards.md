# rag — 闪卡

> 本篇讲 **RAG 全链路主线**。深入子专题： - [RAG 数据清理](./rag-data-cleaning.md)——**入库前**：抽取/分块/元数据/去重/质量过滤（主线 Chunking 的实现级深潜） - [RAG 上下文剪枝](./rag-context-pruning.md)——**检索后**：用小模型砍掉废话保住召回（主线"上下文构造"的实现级深潜） - [RAG 存量清理](./rag-storage-cleanup.md)——**运维/版本化**：对已入库旧 chunk 的审计、淘汰、版本迁移

## 记忆口诀

- **链路**：离线切块/向量化/灌库 / 在线问题向量化召回 / 塞 prompt 看着答
- **选型**：加知识时效溯源用 RAG / 改风格能力用微调 / 二者可组合
- **召回漏斗**：切块 / embedding / 索引 ANN / 混合检索 / rerank / 剪枝——层层设天花板
- **核心心法**：下游只能删不能补 / 召回优先拉多 / 精排剪枝优先选准 / 先拉多再收窄
- **两种 recall**：检索 recall（gold 进没进候选池） / 答案 recall（上下文够不够答对）
- **定位归因**：Context Recall 低=检索锅 / Faithfulness 低=生成幻觉 / Answer Relevancy 低=答非所问

## Card 1

**Q**: 同样是给模型"补知识"，RAG 和微调你会怎么选？各自适合什么、能否组合？

**A**: 加事实/时效/私域知识、要溯源用 RAG（改库即更新、可给引用）；改风格/格式/能力用微调。加知识微调慢贵易遗忘难更新，故二者常组合：RAG 供知识、微调调行为。

## Card 2

**Q**: RAG 里有"检索 recall"和"答案 recall"两种召回率，它们分别衡量什么？掉了各往哪查？

**A**: 检索 recall：gold 文档有没有进候选池，属切块/embedding/索引/检索层，掉了往上游逐层查漏召。答案 recall：进 prompt 的上下文够不够答对，属剪枝/截断层，掉了说明截断太狠，放宽保留数。

## Card 3

**Q**: 为什么说 RAG 里"下游只能删不能补"？这句心法如何指导排查召回问题？

**A**: rerank/剪枝只能在上一层已召回的候选里取舍，gold 一旦没进 top_n/top_m 后面再强也救不回。故召回是答案质量天花板，排查要自上而下逐层查 gold coverage，找到第一个丢它的层只修那一层。

## Card 4

**Q**: "召回不准怎么提升？"——请用漏斗视角成体系地回答，而不是零散堆手段。

**A**: 把召回看成逐层收窄漏斗（切块→embedding→索引→检索→剪枝），每层设天花板。自上而下：结构化切+overlap+small-to-big；换/微调领域 embedding+HyDE/Multi-Query；调大 ef_search/nprobe；混合检索+RRF；先拉大 top_n 再靠 rerank 收窄。

## Card 5

**Q**: 答案质量差时，怎么判断是"检索的锅"还是"生成的锅"？各自怎么修？

**A**: 看 RAGAS 指标：Context Recall 低=检索锅→自上而下查漏斗；Faithfulness 低=生成幻觉→强化 prompt 只依据资料+标引用；Answer Relevancy 低=答非所问→Query 改写/意图路由。先看 Context Recall，检索没到生成再强也白搭。
