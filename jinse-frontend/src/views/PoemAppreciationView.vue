<template>
  <section class="w-full py-16 sm:py-20">
    <div class="mx-auto w-full max-w-5xl px-4">
      <h1 class="text-center text-3xl font-serif font-bold text-dark sm:text-4xl">
        <span class="inline-block border-b-2 border-primary pb-2">诗句深度赏析</span>
      </h1>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <h2 class="text-center text-3xl font-serif font-bold text-primary">锦瑟</h2>
        <p class="mt-2 text-center text-dark/60">李商隐 · 唐代</p>

        <div class="mt-8 grid grid-cols-1 gap-4">
          <button
            v-for="line in poemLines"
            :key="line.id"
            type="button"
            class="rounded-lg px-6 py-5 text-center text-2xl font-serif transition"
            :class="line.id === selectedLineId
              ? 'bg-primary/10 text-primary shadow-sm'
              : 'text-dark/85 hover:bg-primary/5'"
            @click="selectedLineId = line.id"
          >
            {{ line.displayLine }}
          </button>
        </div>
      </article>

      <article class="mt-12 rounded-2xl border border-primary/10 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <h2 class="text-3xl font-serif font-bold text-primary">{{ currentLine.title }}</h2>

        <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 class="text-xl font-serif font-bold text-dark/80">拼音</h3>
            <p class="mt-3 text-lg text-dark/70">{{ currentLine.pinyin }}</p>

            <h3 class="mt-8 text-xl font-serif font-bold text-dark/80">注释</h3>
            <ul class="mt-3 list-disc space-y-2 pl-5 text-lg leading-8 text-dark/70">
              <li v-for="note in currentLine.notes" :key="note">{{ note }}</li>
            </ul>

            <h3 class="mt-8 text-xl font-serif font-bold text-dark/80">今译</h3>
            <p class="mt-3 text-lg leading-8 text-dark/70">{{ currentLine.translation }}</p>
          </div>

          <div>
            <h3 class="text-xl font-serif font-bold text-dark/80">赏析</h3>
            <p class="mt-3 text-lg leading-8 text-dark/70">{{ currentLine.analysis }}</p>

            <h3 class="mt-8 text-xl font-serif font-bold text-dark/80">情感解读</h3>
            <p class="mt-3 text-lg leading-8 text-dark/70">{{ currentLine.emotion }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const poemLines = [
  {
    id: 0,
    displayLine: '锦瑟无端五十弦，一弦一柱思华年',
    title: '锦瑟无端五十弦 / 一弦一柱思华年',
    pinyin: 'jǐn sè wú duān wǔ shí xián / yī xián yī zhù sī huá nián',
    note: '锦瑟：装饰华美的瑟。无端：平白无故、没来由。五十弦：托古写法，强调乐器繁弦与情思繁复。一弦一柱：借细部写触发回忆。华年：美好年华、青春岁月。',
    translation: '华美的锦瑟平白无故竟有五十根弦，每一根弦、每一根柱都勾起我对青春年华的追想。',
    analysis: '首联两句以锦瑟起兴，前句借“繁弦”牵出纷纭难明的人生感受，“无端”二字奠定幽微含蓄的情绪基调；后句点出全诗“追忆华年”的核心情绪，将青春、理想与身世感伤都融进“思”字之中，一景一情，互为呼应。',
    emotion: '旧忆被无端触发，轻怨中带着对青春年华的浓重追忆，哀而不伤，奠定全诗怅惘的基调。',
  },
  {
    id: 1,
    displayLine: '庄生晓梦迷蝴蝶，望帝春心托杜鹃',
    title: '庄生晓梦迷蝴蝶 / 望帝春心托杜鹃',
    pinyin: 'zhuāng shēng xiǎo mèng mí hú dié / wàng dì chūn xīn tuō dù juān',
    note: '庄生梦蝶出自《庄子·齐物论》，写庄周梦中化蝶，醒后难分物我真幻。望帝啼鹃源于古代蜀王杜宇传说，后世常借杜鹃啼血寄寓哀思与执念。',
    translation: '庄周在清晓梦境中迷失于蝶影，真与幻难以分辨；望帝把春日里难言的愁心寄托在杜鹃哀鸣之中。',
    analysis: '颔联两句对仗工整，一虚一哀、一梦一啼。前句借庄生梦蝶写人生如梦、情感迷离，后句借望帝啼鹃抒深情执念与悲怆，将抽象的情感具象化，深化了全诗的悲怆之感。',
    emotion: '从庄生梦蝶的迷惘空灵，到望帝啼鹃的凄婉哀恻，情感层层递进，既写人生的虚幻，又抒执念的深重。',
  },
  {
    id: 2,
    displayLine: '沧海月明珠有泪，蓝田日暖玉生烟',
    title: '沧海月明珠有泪 / 蓝田日暖玉生烟',
    pinyin: 'cāng hǎi yuè míng zhū yǒu lèi / lán tián rì nuǎn yù shēng yān',
    note: '珠有泪常联想到鲛人泣泪成珠的传说。沧海与明月共同构成辽阔、冷清而晶莹的意境。蓝田产玉。“玉生烟”常被用来形容美玉精气氤氲，若隐若现，可望而不可即。',
    translation: '明月映照沧海，仿佛珍珠也含着泪光；温暖的阳光照着蓝田，美玉像蒸腾起轻烟一般朦胧。',
    analysis: '颈联两句以极致的意象化手法写景抒情，一冷一暖、一明一朦形成鲜明对照。“沧海珠泪”藏理想破碎的凄美感，“蓝田玉烟”写美好事物可望不可即的失落感，将《锦瑟》的朦胧美与含蓄美推向顶峰。',
    emotion: '清冷凄美与空灵朦胧交织，看似写景，实则藏着对美好逝去的惋惜与失落，含悲而不直说，余味悠长。',
  },
  {
    id: 3,
    displayLine: '此情可待成追忆，只是当时已惘然',
    title: '此情可待成追忆，只是当时已惘然',
    pinyin: 'cǐ qíng kě dài chéng zhuī yì，zhǐ shì dāng shí yǐ wǎng rán',
    note: '可待：哪里还等到。惘然：迷惘若失、怅惘难明。',
    translation: '这种情感哪里还等到今天才成为追忆，其实在当时就已经令人怅惘迷离了。',
    analysis: '尾联两句总束全诗，将前文的庄生梦蝶、望帝啼鹃、沧海珠泪、蓝田玉烟所有意象与情感，最终都落在“惘然”二字上。它不给出单一解读，而是保留情感的多义性与余韵，让全诗的怅惘之感更显深沉。',
    emotion: '回望过往，所有的情感都化为迷惘若失的怅惘，当时的惘然在追忆中更显深情，是全诗情感的集中升华。',
  },
]

const selectedLineId = ref(0)

const currentLine = computed(() => {
  const matchedLine = poemLines.find((line) => line.id === selectedLineId.value) || poemLines[0]
  const notes = matchedLine.note
    .split(/[。；]/)
    .map((item) => item.trim())
    .filter(Boolean)

  return {
    ...matchedLine,
    notes,
  }
})
</script>

