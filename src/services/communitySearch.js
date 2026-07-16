const STORAGE_KEY =
  'localhub_posts_v1'

const MAX_RESULT_COUNT = 5

const COMMUNITY_QUERY_KEYWORDS = [
  '커뮤니티',
  '게시판',
  '게시글',
  '작성글',
  '글 찾아',
  '글 검색',
]

const STOP_WORDS = new Set([
  '커뮤니티',
  '게시판',
  '게시글',
  '작성글',
  '글',
  '관련',
  '관한',
  '대한',
  '찾아줘',
  '찾아주세요',
  '검색해줘',
  '검색해주세요',
  '알려줘',
  '알려주세요',
  '보여줘',
  '보여주세요',
  '있어',
  '있나요',
  '있니',
  '해줘',
  '해주세요',
  '좀',
  '에서',
  '에',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '의',
  '도',
])

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function includesCommunityKeyword(
  question,
) {
  const normalizedQuestion =
    normalizeText(question)

  return COMMUNITY_QUERY_KEYWORDS.some(
    (keyword) =>
      normalizedQuestion.includes(
        normalizeText(keyword),
      ),
  )
}

function readCommunityPosts() {
  if (
    typeof window === 'undefined' ||
    !window.localStorage
  ) {
    return []
  }

  try {
    const savedPosts =
      window.localStorage.getItem(
        STORAGE_KEY,
      )

    if (!savedPosts) {
      return []
    }

    const parsedPosts =
      JSON.parse(savedPosts)

    return Array.isArray(parsedPosts)
      ? parsedPosts
      : []
  } catch (error) {
    console.error(
      '커뮤니티 게시글을 읽지 못했습니다.',
      error,
    )

    return []
  }
}

function extractQuotedKeyword(question) {
  const text = String(question ?? '')

  const patterns = [
    /'([^']+)'/,
    /"([^"]+)"/,
    /‘([^’]+)’/,
    /“([^”]+)”/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)

    if (match?.[1]?.trim()) {
      return normalizeText(match[1])
    }
  }

  return null
}

function stripParticle(token) {
  const particles = [
    '에서',
    '에는',
    '으로',
    '까지',
    '부터',
    '에게',
    '한테',
    '에',
    '의',
    '은',
    '는',
    '이',
    '가',
    '을',
    '를',
    '도',
  ]

  let result = token

  for (const particle of particles) {
    if (
      result.length >
        particle.length + 1 &&
      result.endsWith(particle)
    ) {
      result = result.slice(
        0,
        -particle.length,
      )

      break
    }
  }

  return result
}

function extractSearchKeywords(question) {
  const quotedKeyword =
    extractQuotedKeyword(question)

  if (quotedKeyword) {
    return [quotedKeyword]
  }

  let text = normalizeText(question)

  for (
    const keyword of
    COMMUNITY_QUERY_KEYWORDS
  ) {
    text = text
      .split(normalizeText(keyword))
      .join(' ')
  }

  return text
    .replace(
      /[?!.,()[\]{}"'`~:;/\\]/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(stripParticle)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter(
      (token) =>
        !STOP_WORDS.has(token),
    )
    .filter(
      (token) =>
        token.length >= 2,
    )
}

function createSearchableText(post) {
  return normalizeText(
    [
      post.title,
      post.content,
      post.category,
    ].join(' '),
  )
}

function createPublicPost(post) {
  const normalizedContent =
    String(post.content ?? '')
      .replace(/\s+/g, ' ')
      .trim()

  return {
    id: String(post.id ?? ''),

    title:
      String(post.title ?? '').trim() ||
      '제목 없음',

    category:
      String(
        post.category ?? '',
      ).trim() || '카테고리 없음',

    contentPreview:
      normalizedContent.length > 140
        ? `${normalizedContent.slice(
            0,
            140,
          )}…`
        : normalizedContent,

    createdAt:
      String(post.createdAt ?? ''),
  }
}

function comparePosts(
  a,
  b,
  keywords,
) {
  const primaryKeyword =
    keywords[0] ?? ''

  const aTitle =
    normalizeText(a.title)

  const bTitle =
    normalizeText(b.title)

  const aExact =
    primaryKeyword &&
    aTitle === primaryKeyword

  const bExact =
    primaryKeyword &&
    bTitle === primaryKeyword

  if (aExact !== bExact) {
    return Number(bExact) -
      Number(aExact)
  }

  const aStarts =
    primaryKeyword &&
    aTitle.startsWith(primaryKeyword)

  const bStarts =
    primaryKeyword &&
    bTitle.startsWith(primaryKeyword)

  if (aStarts !== bStarts) {
    return Number(bStarts) -
      Number(aStarts)
  }

  const aTime = new Date(
    a.createdAt ?? 0,
  ).getTime()

  const bTime = new Date(
    b.createdAt ?? 0,
  ).getTime()

  return bTime - aTime
}

export function searchCommunityPostsFromQuestion(
  question,
) {
  const isCommunityQuery =
    includesCommunityKeyword(question)

  if (!isCommunityQuery) {
    return {
      isCommunityQuery: false,
      total: 0,
      keywords: [],
      posts: [],
    }
  }

  const posts =
    readCommunityPosts()

  const keywords =
    extractSearchKeywords(question)

  const matchedPosts =
    keywords.length === 0
      ? posts
      : posts.filter((post) => {
          const searchableText =
            createSearchableText(post)

          return keywords.every(
            (keyword) =>
              searchableText.includes(
                keyword,
              ),
          )
        })

  const sortedPosts = [
    ...matchedPosts,
  ].sort((a, b) =>
    comparePosts(a, b, keywords),
  )

  return {
    isCommunityQuery: true,
    total: sortedPosts.length,
    keywords,
    posts: sortedPosts
      .slice(0, MAX_RESULT_COUNT)
      .map(createPublicPost),
  }
}