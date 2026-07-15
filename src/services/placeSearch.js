import { allPlaces } from './placeData.js'

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 10
const COURSE_PLACE_COUNT = 3

const LIMITATION_MESSAGE =
  '현재 LocalHub 데이터에는 운영시간, 가격, 휴무일, 메뉴, 정확한 축제 일정 등의 정보가 없어 확인할 수 없습니다. 장소명, 주소, 지역, 콘텐츠 유형은 안내할 수 있습니다.'

const CATEGORY_ALIASES = [
  {
    category: '축제공연행사',
    aliases: [
      '축제공연행사',
      '축제 공연 행사',
      '축제',
      '행사',
      '공연',
    ],
  },
  {
    category: '여행코스',
    aliases: ['여행코스', '여행 코스'],
  },
  {
    category: '문화시설',
    aliases: [
      '문화시설',
      '문화 시설',
      '박물관',
      '미술관',
    ],
  },
  {
    category: '음식점',
    aliases: [
      '음식점',
      '맛집',
      '식당',
      '카페',
    ],
  },
  {
    category: '관광지',
    aliases: [
      '관광지',
      '명소',
      '볼거리',
    ],
  },
  {
    category: '숙박',
    aliases: [
      '숙박',
      '숙소',
      '호텔',
      '펜션',
    ],
  },
  {
    category: '쇼핑',
    aliases: [
      '쇼핑',
      '시장',
    ],
  },
  {
    category: '레포츠',
    aliases: [
      '레포츠',
      '체험',
      '운동',
    ],
  },
]

const LOCATION_ALIASES = [
  // 세부 지역을 광역 지역보다 먼저 검사해야 합니다.
  {
    location: '유성구',
    aliases: ['유성구'],
  },
  {
    location: '대덕구',
    aliases: ['대덕구'],
  },
  {
    location: '서구',
    aliases: ['서구'],
  },
  {
    location: '중구',
    aliases: ['중구'],
  },
  {
    location: '동구',
    aliases: ['동구'],
  },
  {
    location: '공주시',
    aliases: ['공주시', '공주'],
  },
  {
    location: '논산시',
    aliases: ['논산시', '논산'],
  },
  {
    location: '계룡시',
    aliases: ['계룡시', '계룡'],
  },
  {
    location: '옥천군',
    aliases: ['옥천군', '옥천'],
  },
  {
    location: '충청권',
    aliases: ['충청도', '충청권'],
  },
  {
    location: '대전광역시',
    aliases: ['대전광역시', '대전'],
  },
  {
    location: '충청남도',
    aliases: ['충청남도', '충남'],
  },
  {
    location: '충청북도',
    aliases: ['충청북도', '충북'],
  },
]

const LIMITATION_KEYWORDS = [
  '운영시간',
  '운영 시간',
  '영업시간',
  '영업 시간',
  '오늘 영업',
  '문 열',
  '문 닫',
  '몇 시',
  '몇시',
  '오픈 시간',
  '마감 시간',
  '입장료',
  '가격',
  '요금',
  '휴무일',
  '메뉴',
  '예약',
  '주차',
  '혼잡도',
  '날씨',
  '축제 날짜',
  '축제 일정',
  '언제 시작',
]

const COURSE_KEYWORDS = [
  '당일치기',
  '데이트',
  '나들이',
  '장소 조합',
  '코스 추천',
  '코스 짜',
  '코스 만들어',
  '코스 만들',
  '코스 구성',
]

const FOLLOW_UP_KEYWORDS = [
  '그 중',
  '그중',
  '그 가운데',
  '위 결과',
  '방금 결과',
  '예시',
  '몇 개 보여',
  '몇 곳 보여',
  '몇 군데 보여',
  '들어줘',
]

const STOP_WORDS = new Set([
  '알려줘',
  '알려주세요',
  '알려',
  '찾아줘',
  '찾아주세요',
  '찾아',
  '추천해줘',
  '추천해주세요',
  '추천',
  '보여줘',
  '보여주세요',
  '보여',
  '소개해줘',
  '소개해주세요',
  '소개',
  '어디',
  '어디야',
  '어디에',
  '위치',
  '주소',
  '어떤',
  '뭐야',
  '무엇',
  '장소',
  '지역',
  '정보',
  '있어',
  '있나요',
  '있니',
  '해주세요',
  '해줘',
  '부탁해',
  '부탁',
  '좀',
  '가볼만한',
  '갈만한',
  '가볼',
  '갈',
  '만한',
  '있는',
  '있고',
  '전체',
  '총',
  '몇',
  '몇개',
  '몇개야',
  '몇곳',
  '몇곳이야',
  '몇군데',
  '개수',
  '갯수',
  '곳',
  '군데',
  '개',
  '사진',
  '이미지',
  '에서',
  '에는',
  '으로',
  '에',
  '의',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '도',
  '와',
  '과',
  '요',
])

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function includesAny(text, keywords) {
  return keywords.some((keyword) =>
    text.includes(normalizeText(keyword)),
  )
}

function extractCategory(
  normalizedQuestion,
) {
  for (const entry of CATEGORY_ALIASES) {
    const sortedAliases = [
      ...entry.aliases,
    ].sort(
      (a, b) => b.length - a.length,
    )

    if (
      sortedAliases.some((alias) =>
        normalizedQuestion.includes(
          normalizeText(alias),
        ),
      )
    ) {
      return entry.category
    }
  }

  return null
}

function extractLocation(
  normalizedQuestion,
) {
  for (const entry of LOCATION_ALIASES) {
    const sortedAliases = [
      ...entry.aliases,
    ].sort(
      (a, b) => b.length - a.length,
    )

    if (
      sortedAliases.some((alias) =>
        normalizedQuestion.includes(
          normalizeText(alias),
        ),
      )
    ) {
      return entry.location
    }
  }

  return null
}

function extractLimit(
  normalizedQuestion,
) {
  const match =
    normalizedQuestion.match(
      /(\d{1,2})\s*(곳|개|군데)/,
    )

  if (!match) {
    return DEFAULT_LIMIT
  }

  const parsedLimit = Number(match[1])

  if (!Number.isFinite(parsedLimit)) {
    return DEFAULT_LIMIT
  }

  return Math.min(
    MAX_LIMIT,
    Math.max(1, parsedLimit),
  )
}

function isCountRequest(
  normalizedQuestion,
) {
  return (
    /몇\s*(개|곳|군데)/.test(
      normalizedQuestion,
    ) ||
    normalizedQuestion.includes(
      '개수',
    ) ||
    normalizedQuestion.includes(
      '갯수',
    ) ||
    normalizedQuestion.includes(
      '총 몇',
    )
  )
}

function isCourseRequest(
  normalizedQuestion,
  category,
) {
  const hasClearCourseKeyword =
    includesAny(
      normalizedQuestion,
      COURSE_KEYWORDS,
    )

  if (!hasClearCourseKeyword) {
    return false
  }

  if (
    category === '여행코스' &&
    !includesAny(
      normalizedQuestion,
      [
        '당일치기',
        '데이트',
        '나들이',
        '장소 조합',
        '코스 짜',
        '코스 만들어',
        '코스 만들',
        '코스 구성',
      ],
    )
  ) {
    return false
  }

  return true
}

function determineIntent(
  normalizedQuestion,
  category,
) {
  if (
    includesAny(
      normalizedQuestion,
      LIMITATION_KEYWORDS,
    )
  ) {
    return 'limitation'
  }

  if (
    isCountRequest(
      normalizedQuestion,
    )
  ) {
    return 'count'
  }

  if (
    isCourseRequest(
      normalizedQuestion,
      category,
    )
  ) {
    return 'course'
  }

  return 'search'
}

function findExactTitleMatches(
  normalizedQuestion,
) {
  return allPlaces
    .filter((place) => {
      const normalizedTitle =
        normalizeText(place.title)

      return (
        normalizedTitle.length >= 2 &&
        normalizedQuestion.includes(
          normalizedTitle,
        )
      )
    })
    .sort(
      (a, b) =>
        normalizeText(b.title).length -
        normalizeText(a.title).length,
    )
}

function getAllKnownAliases() {
  const categoryAliases =
    CATEGORY_ALIASES.flatMap(
      (entry) => entry.aliases,
    )

  const locationAliases =
    LOCATION_ALIASES.flatMap(
      (entry) => entry.aliases,
    )

  return [
    ...categoryAliases,
    ...locationAliases,
    ...LIMITATION_KEYWORDS,
    ...COURSE_KEYWORDS,
    ...FOLLOW_UP_KEYWORDS,
  ]
    .map(normalizeText)
    .sort(
      (a, b) => b.length - a.length,
    )
}

function removeKnownAliases(text) {
  return getAllKnownAliases().reduce(
    (result, alias) =>
      result.split(alias).join(' '),
    text,
  )
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

function extractSearchKeywords(
  normalizedQuestion,
  exactTitleMatches,
) {
  if (
    exactTitleMatches.length > 0
  ) {
    return []
  }

  let text = removeKnownAliases(
    normalizedQuestion,
  )

  text = text
    // 몇 개야, 몇 곳인가요 등의 표현 제거
    .replace(
      /몇\s*(개|곳|군데)(?:나|야|이야|인가|인가요|인지|입니까|예요|이에요)?/g,
      ' ',
    )

    // 개수, 갯수, 총 개수 등의 표현 제거
    .replace(
      /(?:총\s*)?(개수|갯수|수량)/g,
      ' ',
    )

    // 3곳, 5개, 2군데 등의 표시 개수 제거
    .replace(
      /\d{1,2}\s*(곳|개|군데)/g,
      ' ',
    )

    .replace(
      /[?!.,()[\]{}"'`~:;/\\]/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) {
    return []
  }

  return text
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

function getPlaceAddress(place) {
  return String(
    place.address ??
      place.addr1 ??
      '',
  )
}

function matchesLocation(
  place,
  location,
) {
  if (!location) {
    return true
  }

  const normalizedAddress =
    normalizeText(
      getPlaceAddress(place),
    )

  if (location === '충청권') {
    return (
      normalizedAddress.includes(
        '충청남도',
      ) ||
      normalizedAddress.includes(
        '충청북도',
      )
    )
  }

  return normalizedAddress.includes(
    normalizeText(location),
  )
}

function matchesCategory(
  place,
  category,
) {
  if (!category) {
    return true
  }

  return (
    String(place.contentType) ===
    category
  )
}

function matchesImageRequirement(
  place,
  requiresImage,
) {
  if (!requiresImage) {
    return true
  }

  return Boolean(place.imageUrl)
}

function matchesSearchKeywords(
  place,
  keywords,
) {
  if (keywords.length === 0) {
    return true
  }

  const searchableText =
    normalizeText(
      [
        place.title,
        getPlaceAddress(place),
        place.contentType,
      ].join(' '),
    )

  return keywords.every(
    (keyword) =>
      searchableText.includes(
        keyword,
      ),
  )
}

function comparePlacesByImage(
  a,
  b,
) {
  const aHasImage =
    Boolean(a.imageUrl)

  const bHasImage =
    Boolean(b.imageUrl)

  if (aHasImage !== bHasImage) {
    return (
      Number(bHasImage) -
      Number(aHasImage)
    )
  }

  return String(a.title).localeCompare(
    String(b.title),
    'ko-KR',
  )
}

function sortPlacesByImagePreference(
  places,
) {
  return [...places].sort(
    comparePlacesByImage,
  )
}

function filterPlaces({
  location,
  category,
  requiresImage,
  keywords,
  exactTitleMatches,
}) {
  const hasExactTitle =
    exactTitleMatches.length > 0

  const source = hasExactTitle
    ? exactTitleMatches
    : allPlaces

  return source.filter((place) => {
    if (
      !matchesImageRequirement(
        place,
        requiresImage,
      )
    ) {
      return false
    }

    if (hasExactTitle) {
      return true
    }

    return (
      matchesLocation(
        place,
        location,
      ) &&
      matchesCategory(
        place,
        category,
      ) &&
      matchesSearchKeywords(
        place,
        keywords,
      )
    )
  })
}

function findFirstUnselectedPlace(
  candidates,
  categories,
  selectedIds,
) {
  return candidates.find(
    (place) =>
      categories.includes(
        place.contentType,
      ) &&
      !selectedIds.has(
        String(place.id),
      ),
  )
}

function selectCoursePlaces(
  candidates,
  requestedLimit,
) {
  const targetCount = Math.min(
    COURSE_PLACE_COUNT,
    requestedLimit,
  )

  const selectedPlaces = []
  const selectedIds = new Set()

  const categoryGroups = [
    ['관광지', '문화시설'],
    ['음식점'],
    [
      '쇼핑',
      '레포츠',
      '관광지',
      '문화시설',
    ],
  ]

  for (
    const categories of categoryGroups
  ) {
    if (
      selectedPlaces.length >=
      targetCount
    ) {
      break
    }

    const place =
      findFirstUnselectedPlace(
        candidates,
        categories,
        selectedIds,
      )

    if (place) {
      selectedPlaces.push(place)

      selectedIds.add(
        String(place.id),
      )
    }
  }

  for (const place of candidates) {
    if (
      selectedPlaces.length >=
      targetCount
    ) {
      break
    }

    const placeId =
      String(place.id)

    if (
      !selectedIds.has(placeId)
    ) {
      selectedPlaces.push(place)
      selectedIds.add(placeId)
    }
  }

  return selectedPlaces
}

export function searchPlacesFromQuestion(
  question,
  previousFilters = null,
) {
  const normalizedQuestion =
    normalizeText(question)

  const explicitCategory =
    extractCategory(
      normalizedQuestion,
    )

  const explicitLocation =
    extractLocation(
      normalizedQuestion,
    )

  const isFollowUp =
    includesAny(
      normalizedQuestion,
      FOLLOW_UP_KEYWORDS,
    )

  const category =
    explicitCategory ??
    (
      isFollowUp
        ? previousFilters?.category ??
          null
        : null
    )

  const location =
    explicitLocation ??
    (
      isFollowUp
        ? previousFilters?.location ??
          null
        : null
    )

  const explicitlyRequiresImage =
    normalizedQuestion.includes(
      '사진',
    ) ||
    normalizedQuestion.includes(
      '이미지',
    )

  const requiresImage =
    explicitlyRequiresImage ||
    (
      isFollowUp &&
      Boolean(
        previousFilters
          ?.requiresImage,
      )
    )

  const limit = extractLimit(
    normalizedQuestion,
  )

  const intent = determineIntent(
    normalizedQuestion,
    category,
  )

  const exactTitleMatches =
    findExactTitleMatches(
      normalizedQuestion,
    )

  let keywords

  if (
    isFollowUp &&
    Array.isArray(
      previousFilters?.keywords,
    )
  ) {
    keywords =
      previousFilters.keywords
  } else {
    keywords =
      extractSearchKeywords(
        normalizedQuestion,
        exactTitleMatches,
      )
  }

  const filters = {
    location,
    category,
    requiresImage,
    keywords,
    limit,
    isFollowUp,
  }

  if (intent === 'limitation') {
    const limitationPlaces =
      sortPlacesByImagePreference(
        exactTitleMatches.filter(
          (place) =>
            matchesImageRequirement(
              place,
              requiresImage,
            ),
        ),
      ).slice(0, limit)

    return {
      intent,
      filters,
      total:
        exactTitleMatches.length,
      places: limitationPlaces,
      limitationMessage:
        LIMITATION_MESSAGE,
      needsClarification: false,
    }
  }

  if (intent === 'course') {
    if (!location) {
      return {
        intent,
        filters,
        total: 0,
        places: [],
        limitationMessage: null,
        needsClarification: true,
      }
    }

    const courseCandidates =
      sortPlacesByImagePreference(
        allPlaces.filter(
          (place) =>
            matchesLocation(
              place,
              location,
            ) &&
            matchesImageRequirement(
              place,
              requiresImage,
            ),
        ),
      )

    return {
      intent,
      filters,
      total:
        courseCandidates.length,
      places: selectCoursePlaces(
        courseCandidates,
        limit,
      ),
      limitationMessage: null,
      needsClarification: false,
    }
  }

  const filteredPlaces =
    sortPlacesByImagePreference(
      filterPlaces({
        location,
        category,
        requiresImage,
        keywords,
        exactTitleMatches,
      }),
    )

  return {
    intent,
    filters,
    total:
      filteredPlaces.length,
    places:
      filteredPlaces.slice(
        0,
        limit,
      ),
    limitationMessage: null,
    needsClarification: false,
  }
}