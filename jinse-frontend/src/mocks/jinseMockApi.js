const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

const poemLines = [
  { text: '锦瑟无端五十弦', pinyin: 'jǐn sè wú duān wǔ shí xián' },
  { text: '庄生晓梦迷蝴蝶', pinyin: 'zhuāng shēng xiǎo mèng mí hú dié' },
  { text: '望帝春心托杜鹃', pinyin: 'wàng dì chūn xīn tuō dù juān' },
  { text: '沧海月明珠有泪', pinyin: 'cāng hǎi yuè míng zhū yǒu lèi' },
  { text: '蓝田日暖玉生烟', pinyin: 'lán tián rì nuǎn yù shēng yān' },
]

const allusionStoryMap = {
  '锦瑟无端五十弦': '典故出处：《史记·封禅书》。古瑟五十弦，音调悲怆，后改为二十五弦。诗人借“锦瑟”起兴，用繁弦映照繁复心绪，开启全诗“追忆华年”的情感线。',
  '庄生晓梦迷蝴蝶': '典故出处：《庄子·齐物论》。庄周梦中化蝶，醒后难辨真幻。诗句借梦蝶写人生恍惚与情感迷离，强化《锦瑟》的朦胧美与哲思感。',
  '望帝春心托杜鹃': '典故出处：望帝杜宇化鹃传说。杜鹃啼血常寄寓执念与哀思。诗中以“春心托杜鹃”呈现深情难言、低回悲怆的情绪推进。',
  '沧海月明珠有泪': '典故来源：鲛人泣珠传说。明月、沧海、珠泪交织成清冷凄美意境，暗含理想破碎与身世感伤。',
  '蓝田日暖玉生烟': '典故来源：蓝田美玉意象。“玉生烟”强调可望难即、朦胧空灵，作为全诗重要的审美高点与情绪回声。',
}

const pictureBookPrompts = {
  '锦瑟无端五十弦': [
    '锦瑟横卧，五十弦清晰可见，锦缎纹理与柔光交织。',
    '素女弹瑟，乐声似泣，画面以水墨渲染悲感。',
    '器物静置，回忆感增强，暖冷对比表现“华年”远去。',
  ],
  '庄生晓梦迷蝴蝶': [
    '庄周沉睡，晨雾微起，梦境入口被轻柔笔触打开。',
    '蝴蝶群舞，花影摇曳，现实与梦境边界模糊。',
    '庄周与蝶影叠合，真幻难分，画面留白强化哲思。',
    '梦醒凝思，室内晨光斜入，人物神情迷惘。',
    '蝴蝶远去，人物独坐，余韵低回。',
  ],
  '望帝春心托杜鹃': [
    '望帝立于高台，远山重叠，情绪先抑后扬。',
    '春林深处杜鹃啼鸣，红色点染强化悲怆。',
    '人物背影与飞鸟同框，执念与别离并置。',
    '句尾回落，画面收束于暮春冷色。',
  ],
  '沧海月明珠有泪': [
    '沧海广阔，明月高悬，海面冷光流动。',
    '珠泪特写，晶莹中带悲意，氛围凄美。',
  ],
  '蓝田日暖玉生烟': [
    '蓝田山谷受暖阳照拂，色调温润。',
    '玉气轻烟上升，远观可见、近看若无。',
    '山色与烟岚融合，形成可望难即的空灵结尾。',
  ],
}

const imageUrlMap = {
  '锦瑟无端五十弦': ['/data/绘本图片/锦瑟无端五十弦/1.png', '/data/绘本图片/锦瑟无端五十弦/2.png', '/data/绘本图片/锦瑟无端五十弦/3.png'],
  '庄生晓梦迷蝴蝶': ['/data/绘本图片/庄生晓梦迷蝴蝶/庄周梦蝶1.png', '/data/绘本图片/庄生晓梦迷蝴蝶/庄周梦蝶2.png', '/data/绘本图片/庄生晓梦迷蝴蝶/庄周梦蝶3.png', '/data/绘本图片/庄生晓梦迷蝴蝶/庄周梦蝶4.png', '/data/绘本图片/庄生晓梦迷蝴蝶/庄周梦蝶5.png'],
  '望帝春心托杜鹃': ['/data/绘本图片/望帝春心托杜鹃/1.png', '/data/绘本图片/望帝春心托杜鹃/2.png', '/data/绘本图片/望帝春心托杜鹃/3.png', '/data/绘本图片/望帝春心托杜鹃/4.png'],
  '沧海月明珠有泪': ['/data/绘本图片/沧海月明珠有泪/1.png', '/data/绘本图片/沧海月明珠有泪/2.png'],
  '蓝田日暖玉生烟': ['/data/绘本图片/蓝田日暖玉生烟/1.png', '/data/绘本图片/蓝田日暖玉生烟/2.png', '/data/绘本图片/蓝田日暖玉生烟/3.png'],
}

const emotionDimensions = ['迷惘感', '凄美感', '孤独感', '执念感', '虚无感']

const emotionAnalysisMap = {
  '庄生晓梦迷蝴蝶': {
    line: '庄生晓梦迷蝴蝶',
    explanation: '梦蝶意象强化了真假难辨的迷惘感，也把人生如梦、情感难定的幽微体验推到前景。',
    dimensions: emotionDimensions,
    scores: [0.85, 0.4, 0.5, 0.3, 0.9],
  },
  '望帝春心托杜鹃': {
    line: '望帝春心托杜鹃',
    explanation: '杜鹃啼血承载深情与执念，本句的情绪核心并不是单纯悲伤，而是难以放下的情感牵系。',
    dimensions: emotionDimensions,
    scores: [0.45, 0.78, 0.52, 0.92, 0.38],
  },
  '沧海月明珠有泪': {
    line: '沧海月明珠有泪',
    explanation: '“明月”“沧海”“珠泪”共同营造出清冷凄美的情绪场，悲感被处理得晶莹而节制。',
    dimensions: emotionDimensions,
    scores: [0.52, 0.94, 0.66, 0.41, 0.47],
  },
  '蓝田日暖玉生烟': {
    line: '蓝田日暖玉生烟',
    explanation: '本句更突出朦胧与可望难即之感，情绪并不激烈，但空灵与失落在缓慢扩散。',
    dimensions: emotionDimensions,
    scores: [0.64, 0.71, 0.43, 0.36, 0.82],
  },
  '此情可待成追忆，只是当时已惘然': {
    line: '此情可待成追忆，只是当时已惘然',
    explanation: '尾联把前文所有情绪最终压缩到“惘然”之中，追忆、迷惘与虚无感在这里形成集中收束。',
    dimensions: emotionDimensions,
    scores: [0.91, 0.74, 0.68, 0.49, 0.88],
  },
}

const mockGraph = {
  categories: [{ name: '核心' }, { name: '典故' }, { name: '人物' }, { name: '出处' }, { name: '意象' }, { name: '情感' }],
  nodes: [
    { name: '《锦瑟》', symbolSize: 72, category: 0, value: '全诗核心', info: '李商隐代表作，多义并存，常从追忆华年、梦幻迷惘、凄美惘然几个层面把握。', role: '全诗中心节点，连接诗句、典故、意象与情感。', source: '晚唐诗歌', images: ['华年', '惘然'] },
    { name: '李商隐', symbolSize: 42, category: 2, value: '诗人', info: '晚唐诗人，诗风深婉绮丽，尤擅用典与含蓄表达。', role: '《锦瑟》的作者，个人身世与诗风共同塑造了此诗的朦胧感。', source: '晚唐诗坛', images: ['无题诗', '义山诗风'] },
    { name: '思华年', symbolSize: 38, category: 5, value: '追忆主题', info: '点出全诗核心情绪：对青春、理想、爱情与往事的综合追忆。', role: '统摄首联，并向后联的典故与意象扩散。', source: '首联关键词', images: ['华年', '青春回望'] },
    { name: '惘然', symbolSize: 36, category: 5, value: '结穴词', info: '尾联核心词，表达迷惘若失、无法尽说的情感余味。', role: '收束全诗，连接追忆与迷离。', source: '尾联关键词', images: ['怅惘', '余韵'] },
    { name: '庄生梦蝶', symbolSize: 42, category: 1, value: '人生如梦', info: '庄周梦蝶，醒后难分物我与梦醒，象征虚实难辨与人生迷惘。', role: '强化《锦瑟》的梦幻、空灵与不确定性。', source: '《庄子·齐物论》', images: ['蝴蝶', '梦境'] },
    { name: '望帝啼鹃', symbolSize: 42, category: 1, value: '悲哀执念', info: '望帝杜宇死后化鹃，啼血不止，常寄寓深情与执念。', role: '把含蓄情感转化为哀恻之声，增强悲怆张力。', source: '《华阳国志》及相关传说', images: ['杜鹃', '啼血'] },
    { name: '沧海珠泪', symbolSize: 42, category: 1, value: '凄美遗恨', info: '鲛人泣泪成珠，与沧海明月相连，形成晶莹冷清的凄美意境。', role: '承担颈联的清冷哀感。', source: '鲛人泣珠传说', images: ['明月', '珠泪'] },
    { name: '蓝田玉烟', symbolSize: 42, category: 1, value: '朦胧美', info: '蓝田产玉，“玉生烟”写其精气氤氲，可望不可即。', role: '承担颈联的朦胧与理想化美感。', source: '蓝田玉文化意象', images: ['玉烟', '日暖'] },
    { name: '庄周', symbolSize: 28, category: 2, value: '人物', info: '道家思想人物，梦蝶典故主人公。', role: '为‘庄生梦蝶’提供哲思来源。', source: '《庄子》', images: ['物我齐一'] },
    { name: '杜宇', symbolSize: 28, category: 2, value: '人物', info: '古蜀望帝，常与杜鹃啼血传说相连。', role: '为‘望帝啼鹃’提供人物来源。', source: '蜀地传说', images: ['啼血传说'] },
    { name: '《庄子·齐物论》', symbolSize: 30, category: 3, value: '出处', info: '梦蝶典故原始文献。', role: '提供哲理性出处。', source: '先秦典籍', images: ['梦与醒'] },
    { name: '《华阳国志》', symbolSize: 30, category: 3, value: '出处', info: '望帝杜宇相关传说的重要文献来源之一。', role: '提供历史传说出处。', source: '地方文献', images: ['蜀地传说'] },
    { name: '鲛人泣珠传说', symbolSize: 30, category: 3, value: '出处', info: '鲛人泣泪成珠的神话资源，支撑“珠有泪”。', role: '为珠泪意象提供文化背景。', source: '古代志怪传说', images: ['泣泪成珠'] },
    { name: '蓝田美玉说', symbolSize: 30, category: 3, value: '出处', info: '蓝田玉的文化象征，后世常用以寄寓高洁与朦胧美。', role: '为“玉生烟”提供文化依据。', source: '玉文化传统', images: ['玉气氤氲'] },
    { name: '蝴蝶', symbolSize: 28, category: 4, value: '意象', info: '轻盈、梦幻、虚实难辨。', role: '梦蝶意象的视觉承载。', source: '庄生梦蝶', images: ['梦幻'] },
    { name: '杜鹃', symbolSize: 28, category: 4, value: '意象', info: '啼血、哀鸣、执念不绝。', role: '望帝春心的情绪出口。', source: '望帝啼鹃', images: ['哀鸣'] },
    { name: '明月', symbolSize: 28, category: 4, value: '意象', info: '清冷、皎洁、易引发追怀。', role: '与沧海、珠泪共同构成颈联画面。', source: '沧海月明', images: ['清辉'] },
    { name: '珠泪', symbolSize: 28, category: 4, value: '意象', info: '晶莹而哀伤，象征美好中的破碎感。', role: '加强颈联凄美色彩。', source: '鲛人珠泪', images: ['泪光'] },
    { name: '玉烟', symbolSize: 28, category: 4, value: '意象', info: '若隐若现，温润而不可把握。', role: '加强颈联朦胧美。', source: '蓝田玉烟', images: ['朦胧'] },
    { name: '追忆', symbolSize: 26, category: 5, value: '情感', info: '回望华年，是全诗最显性的情感线索。', role: '从首联延伸到尾联。', source: '思华年', images: ['旧梦'] },
    { name: '迷惘', symbolSize: 26, category: 5, value: '情感', info: '真幻难辨、理想难求所带来的内心迷离。', role: '由梦蝶与惘然共同强化。', source: '庄生晓梦/惘然', images: ['迷离'] },
    { name: '凄美', symbolSize: 26, category: 5, value: '情感', info: '珠泪与杜鹃共同构成哀而美的色调。', role: '使诗歌情感呈现柔婉而深沉的美感。', source: '珠有泪/托杜鹃', images: ['哀美'] },
    { name: '朦胧', symbolSize: 26, category: 5, value: '情感', info: '《锦瑟》最鲜明的审美特征之一：不直说，而留余韵。', role: '统合玉烟、梦蝶与惘然。', source: '全诗审美特征', images: ['若隐若现'] },
    { name: '锦瑟无端五十弦', symbolSize: 32, category: 0, value: '诗句', info: '从器物写起，带出情思繁复。', role: '首联开端。', source: '首句', images: ['繁弦'] },
    { name: '一弦一柱思华年', symbolSize: 32, category: 0, value: '诗句', info: '明点追忆华年。', role: '首联结穴。', source: '首联', images: ['华年'] },
    { name: '庄生晓梦迷蝴蝶', symbolSize: 32, category: 0, value: '诗句', info: '以梦蝶写迷离。', role: '颔联上句。', source: '颔联', images: ['梦蝶'] },
    { name: '望帝春心托杜鹃', symbolSize: 32, category: 0, value: '诗句', info: '以杜鹃写深情哀怨。', role: '颔联下句。', source: '颔联', images: ['杜鹃'] },
    { name: '沧海月明珠有泪', symbolSize: 32, category: 0, value: '诗句', info: '冷月珠泪，凄美空灵。', role: '颈联上句。', source: '颈联', images: ['珠泪'] },
    { name: '蓝田日暖玉生烟', symbolSize: 32, category: 0, value: '诗句', info: '日暖玉烟，朦胧美强。', role: '颈联下句。', source: '颈联', images: ['玉烟'] },
    { name: '只是当时已惘然', symbolSize: 32, category: 0, value: '诗句', info: '尾联结穴，含蓄总结。', role: '尾联关键句。', source: '尾联', images: ['惘然'] },
  ],
  links: [
    { source: '《锦瑟》', target: '李商隐' },
    { source: '《锦瑟》', target: '思华年' },
    { source: '《锦瑟》', target: '惘然' },
    { source: '《锦瑟》', target: '庄生梦蝶' },
    { source: '《锦瑟》', target: '望帝啼鹃' },
    { source: '《锦瑟》', target: '沧海珠泪' },
    { source: '《锦瑟》', target: '蓝田玉烟' },
    { source: '《锦瑟》', target: '锦瑟无端五十弦' },
    { source: '《锦瑟》', target: '一弦一柱思华年' },
    { source: '《锦瑟》', target: '庄生晓梦迷蝴蝶' },
    { source: '《锦瑟》', target: '望帝春心托杜鹃' },
    { source: '《锦瑟》', target: '沧海月明珠有泪' },
    { source: '《锦瑟》', target: '蓝田日暖玉生烟' },
    { source: '《锦瑟》', target: '只是当时已惘然' },
    { source: '思华年', target: '追忆' },
    { source: '惘然', target: '迷惘' },
    { source: '庄生梦蝶', target: '庄周' },
    { source: '庄生梦蝶', target: '《庄子·齐物论》' },
    { source: '庄生梦蝶', target: '蝴蝶' },
    { source: '庄生梦蝶', target: '迷惘' },
    { source: '望帝啼鹃', target: '杜宇' },
    { source: '望帝啼鹃', target: '《华阳国志》' },
    { source: '望帝啼鹃', target: '杜鹃' },
    { source: '望帝啼鹃', target: '凄美' },
    { source: '沧海珠泪', target: '鲛人泣珠传说' },
    { source: '沧海珠泪', target: '明月' },
    { source: '沧海珠泪', target: '珠泪' },
    { source: '沧海珠泪', target: '凄美' },
    { source: '蓝田玉烟', target: '蓝田美玉说' },
    { source: '蓝田玉烟', target: '玉烟' },
    { source: '蓝田玉烟', target: '朦胧' },
    { source: '一弦一柱思华年', target: '思华年' },
    { source: '庄生晓梦迷蝴蝶', target: '庄生梦蝶' },
    { source: '望帝春心托杜鹃', target: '望帝啼鹃' },
    { source: '沧海月明珠有泪', target: '沧海珠泪' },
    { source: '蓝田日暖玉生烟', target: '蓝田玉烟' },
    { source: '只是当时已惘然', target: '惘然' },
    { source: '朦胧', target: '惘然' },
    { source: '追忆', target: '惘然' },
    { source: '迷惘', target: '朦胧' },
  ],
}

const baseQuizQuestions = [
  {
    id: '1',
    question: '“锦瑟无端五十弦”中“无端”更贴近下列哪种理解？',
    options: ['平白无故、难以言说', '端庄有序、结构严谨', '无穷无尽、不可停止', '无所依凭、无从入手'],
    answer: '平白无故、难以言说',
    analysis: '“无端”强调情绪触发的突兀与难明。',
    knowledge_points: ['诗句理解'],
    difficulty: 'medium',
    points: 20,
  },
  {
    id: '2',
    question: '“庄生晓梦迷蝴蝶”主要借用了哪个典故？',
    options: ['庄周梦蝶', '望帝啼鹃', '鲛人泣珠', '蓝田种玉'],
    answer: '庄周梦蝶',
    analysis: '该句直接化用庄周梦蝶，突出真幻难辨。',
    knowledge_points: ['典故识别'],
    difficulty: 'easy',
    points: 20,
  },
  {
    id: '3',
    question: '“沧海月明珠有泪，蓝田日暖玉生烟”在情感上更接近哪项？',
    options: ['热烈豪放', '清冷凄美与朦胧失落', '轻快诙谐', '昂扬激越'],
    answer: '清冷凄美与朦胧失落',
    analysis: '前句清冷、后句空灵，共同营造凄美朦胧感。',
    knowledge_points: ['情感分析', '意象理解'],
    difficulty: 'medium',
    points: 20,
  },
  {
    id: '4',
    question: '声律学习中“韵脚”最常用于帮助学生把握什么？',
    options: ['句尾收束与回环感', '词义注释数量', '作者生平年代', '修辞分类标准'],
    answer: '句尾收束与回环感',
    analysis: '韵脚帮助听觉上形成句尾收束与回环。',
    knowledge_points: ['声律知识'],
    difficulty: 'easy',
    points: 20,
  },
  {
    id: '5',
    question: '对“此情可待成追忆，只是当时已惘然”理解最恰当的是？',
    options: ['情感当时已难明，追忆时更显惘然', '作者已完全释怀往事', '诗意转向写景，不再抒情', '只表达对春景的赞美'],
    answer: '情感当时已难明，追忆时更显惘然',
    analysis: '尾联收束全诗，将复杂情绪归于“惘然”。',
    knowledge_points: ['多义理解'],
    difficulty: 'medium',
    points: 20,
  },
]

const reviewTipMap = {
  '诗句理解': { anchor: 'poem-appreciation', tip: '建议回看逐句赏析，重新抓住句中题眼与关键词。' },
  '典故识别': { anchor: 'knowledge-graph', tip: '建议回看知识图谱中的典故节点，梳理出处与寓意。' },
  '情感分析': { anchor: 'emotion-analysis', tip: '建议回看情感量化与全诗情绪总结，区分迷惘、凄美与惘然。' },
  '声律知识': { anchor: 'tone-analysis', tip: '建议回看平仄与声律分析，重点理解停顿、韵脚和句末收束。' },
  '意象理解': { anchor: 'ai-image', tip: '建议回看诗意生图和意象赏析，抓住月、珠、玉、烟等关键画面。' },
  '多义理解': { anchor: 'poem-appreciation', tip: '建议结合整首诗的多重解读，不要急于归结为单一答案。' },
}

const dimensionMeta = {
  theme: { label: '主题相似', intro: '从追忆、迷惘、深情难言等主题出发，寻找与《锦瑟》相近的作品。' },
  emotion: { label: '情感相似', intro: '从惘然、迷离、低回、凄美等情绪气质切入，延伸阅读相近诗歌。' },
  imagery: { label: '意象相似', intro: '从梦、月、烟、泪等核心意象出发，比较不同作品如何营造相似氛围。' },
  allusion: { label: '典故相似', intro: '从神话传说、历史典故和借典抒情方式出发，建立作品间的知识联系。' },
  style: { label: '风格相似', intro: '从含蓄委婉、朦胧多义等表达方式出发，寻找阅读迁移路径。' },
  era: { label: '同代诗人', intro: '从时代语境出发，推荐与李商隐相近背景的诗作。' },
  author: { label: '同作者延伸', intro: '从李商隐整体诗风出发，扩展同作者阅读。' },
}

const recommendationPool = {
  theme: [
    { id: 't1', title: '无题·相见时难别亦难', author: '李商隐', dynasty: '唐', excerpt: '相见时难别亦难，东风无力百花残。', matched_tags: ['追忆', '深情难言'], support_tags: ['含蓄'], reason: '与《锦瑟》都通过含蓄表达深情与惘然。', learning_value: '可比较“难言之情”如何在意象中展开。', tags: ['主题迁移'], similar_points: ['都不直抒其情', '都以意象组织情绪', '都留下多义解读空间'], compare_focus: '对照两首诗如何通过“难言之情”组织主题推进。', dimension_label: '主题相似' },
    { id: 't2', title: '夜雨寄北', author: '李商隐', dynasty: '唐', excerpt: '何当共剪西窗烛，却话巴山夜雨时。', matched_tags: ['追忆'], support_tags: ['回望'], reason: '同样通过回望结构强化情感层次。', learning_value: '适合比较“当下-追忆”双时态写法。', tags: ['回忆结构'], similar_points: ['都含有回望视角', '都通过场景承载情绪', '都强调余味'], compare_focus: '比较“当下情境”与“追忆情境”如何交错。', dimension_label: '主题相似' },
    { id: 't3', title: '虞美人·春花秋月何时了', author: '李煜', dynasty: '南唐', excerpt: '问君能有几多愁，恰似一江春水向东流。', matched_tags: ['惘然'], support_tags: ['追忆'], reason: '同样以追忆与惘然组织全词情绪。', learning_value: '可比较诗词在追忆主题上的表达差异。', tags: ['惘然'], similar_points: ['都含回望过往', '都强调情绪回环', '都形成余音不尽'], compare_focus: '对照“惘然”在诗与词中的不同呈现。', dimension_label: '主题相似' },
    { id: 't4', title: '登高', author: '杜甫', dynasty: '唐', excerpt: '万里悲秋常作客，百年多病独登台。', matched_tags: ['身世感'], support_tags: ['感伤'], reason: '都将个人感伤与时代体验交织。', learning_value: '可训练“情感层级”阅读能力。', tags: ['身世感'], similar_points: ['都含深层感伤', '都不止于表层景物', '都可多层解读'], compare_focus: '比较个人身世感在两诗中的表达路径。', dimension_label: '主题相似' },
  ],
}

recommendationPool.emotion = recommendationPool.theme
recommendationPool.imagery = recommendationPool.theme
recommendationPool.allusion = recommendationPool.theme
recommendationPool.style = recommendationPool.theme
recommendationPool.era = recommendationPool.theme
recommendationPool.author = recommendationPool.theme

const quizSessions = new Map()

const parseBody = (options) => {
  if (!options || !options.body) {
    return {}
  }
  if (typeof options.body === 'string') {
    try {
      return JSON.parse(options.body)
    } catch (error) {
      return {}
    }
  }
  return options.body
}

const getReviewInfo = (knowledgePoints = []) => {
  for (const kp of knowledgePoints) {
    if (reviewTipMap[kp]) {
      return reviewTipMap[kp]
    }
  }
  return { anchor: 'poem-appreciation', tip: '建议回看对应模块后再作答。' }
}

const buildCheckPayload = (question, userAnswer, timeSpent = 0) => {
  const correct = userAnswer === question.answer
  const review = getReviewInfo(question.knowledge_points || [])
  return {
    id: question.id,
    question: question.question,
    correct,
    user_answer: userAnswer,
    answer: question.answer,
    analysis: question.analysis,
    knowledge_points: question.knowledge_points || [],
    time_spent: Number(timeSpent || 0),
    review_anchor: review.anchor,
    study_tip: review.tip,
    feedback_title: correct ? '回答正确' : '回答错误',
    feedback_variant: correct ? 'success' : 'error',
    explanation_points: [
      `题眼提示：这道题重点考查“${(question.knowledge_points || []).join('、') || '诗句理解'}”。`,
      `正确依据：${question.analysis}`,
      `回看建议：${review.tip}`,
    ],
  }
}

const scoreQuiz = (session, answers, timeSpent) => {
  const questions = session.questions
  let score = 0
  let totalTime = 0
  let correctCount = 0
  const results = []
  const kpStats = {}

  questions.forEach((q) => {
    const answer = answers[String(q.id)]
    const spent = Number(timeSpent[String(q.id)] || 0)
    const result = buildCheckPayload(q, answer, spent)
    if (result.correct) {
      score += q.points || 20
      correctCount += 1
    }
    totalTime += spent
    ;(q.knowledge_points || []).forEach((kp) => {
      const current = kpStats[kp] || { name: kp, correct: 0, total: 0 }
      current.total += 1
      if (result.correct) {
        current.correct += 1
      }
      kpStats[kp] = current
    })
    results.push(result)
  })

  const questionCount = questions.length
  const total = questionCount * 20
  const avgTime = questionCount ? Number((totalTime / questionCount).toFixed(2)) : 0

  const knowledgeStats = Object.values(kpStats).map((item) => {
    const accuracy = item.total ? item.correct / item.total : 0
    const mastery = Math.round(accuracy * 100)
    return {
      name: item.name,
      accuracy,
      avg_time: avgTime,
      mastery,
      label: mastery >= 80 ? '掌握扎实' : mastery >= 60 ? '基本掌握' : '仍需巩固',
    }
  })

  return {
    score,
    total,
    results,
    knowledge_stats: knowledgeStats,
    time_summary: {
      score,
      total,
      correct_count: correctCount,
      question_count: questionCount,
      total_time: Number(totalTime.toFixed(2)),
      avg_time: avgTime,
      accuracy_rate: questionCount ? correctCount / questionCount : 0,
    },
    analysis_text: `本次测验共 ${questionCount} 题，正确 ${correctCount} 题，平均每题 ${avgTime}s。建议重点回看错题对应知识点，再进行一次巩固测验。`,
    recommendations: [],
    source: session.source,
    session_id: session.session_id,
  }
}

export async function mockApi(url, options = {}) {
  await delay()
  const body = parseBody(options)

  if (url === '/api/poem') {
    return { lines: deepClone(poemLines) }
  }

  if (url === '/api/allusion-story') {
    const line = body.line || poemLines[0].text
    return { line, story: allusionStoryMap[line] || '待补充典故故事内容...' }
  }

  if (url === '/api/picture-book') {
    const line = body.line || poemLines[0].text
    const prompts = pictureBookPrompts[line] || pictureBookPrompts[poemLines[0].text]
    const urls = imageUrlMap[line] || []
    return {
      line,
      total_pages: prompts.length,
      current_page: 0,
      pages: prompts.map((prompt, idx) => ({ page_index: idx, prompt, image_url: urls[idx] || '' })),
    }
  }

  if (url === '/api/knowledge-graph') {
    return deepClone(mockGraph)
  }

  if (url === '/api/emotion') {
    const line = body.line || '庄生晓梦迷蝴蝶'
    return deepClone(emotionAnalysisMap[line] || emotionAnalysisMap['庄生晓梦迷蝴蝶'])
  }

  if (url === '/api/quiz/generate') {
    const count = Math.max(3, Math.min(8, Number(body.count || 5)))
    const sessionId = `mock-${Date.now().toString(36).slice(-6)}`
    const questions = deepClone(baseQuizQuestions).slice(0, count)
    const session = {
      session_id: sessionId,
      source: 'mock',
      questions,
    }
    quizSessions.set(sessionId, session)
    return {
      title: '《锦瑟》课堂小测',
      session_id: sessionId,
      source: 'mock',
      difficulty: 'mixed',
      questions: questions.map((q) => ({ ...q, answer: undefined })),
    }
  }

  if (url === '/api/quiz/check') {
    const session = quizSessions.get(body.session_id)
    if (!session) {
      throw new Error('quiz session not found')
    }
    const question = session.questions.find((q) => String(q.id) === String(body.question_id))
    if (!question) {
      throw new Error('question not found')
    }
    return buildCheckPayload(question, body.answer, body.time_spent)
  }

  if (url === '/api/quiz/submit') {
    const session = quizSessions.get(body.session_id)
    if (!session) {
      throw new Error('quiz session not found')
    }
    return scoreQuiz(session, body.answers || {}, body.time_spent || {})
  }

  if (url.startsWith('/api/recommendations')) {
    const query = new URLSearchParams(url.split('?')[1] || '')
    const dimension = query.get('dimension') || 'theme'
    const offset = Math.max(0, Number(query.get('offset') || 0))
    const limit = Math.max(1, Math.min(6, Number(query.get('limit') || 4)))
    const pool = recommendationPool[dimension] || recommendationPool.theme
    const total = pool.length
    const safeOffset = total ? offset % total : 0
    const items = total ? Array.from({ length: Math.min(limit, total) }, (_, idx) => pool[(safeOffset + idx) % total]) : []
    return {
      dimension,
      dimension_label: dimensionMeta[dimension]?.label || dimensionMeta.theme.label,
      intro: dimensionMeta[dimension]?.intro || dimensionMeta.theme.intro,
      total,
      offset: safeOffset,
      limit,
      items: deepClone(items),
      dimensions: Object.entries(dimensionMeta).map(([key, value]) => ({ key, ...value })),
    }
  }

  throw new Error(`No mock route for ${url}`)
}

