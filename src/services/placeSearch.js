import { allPlaces } from './placeData.js'

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 10
const COURSE_PLACE_COUNT = 3

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
      '숙박시설',
      '숙박 시설',
      '숙박',
      '숙소',
    ],
  },
  {
    category: '쇼핑',
    aliases: [
      '쇼핑센터',
      '쇼핑 센터',
      '쇼핑시설',
      '쇼핑 시설',
      '쇼핑몰',
      '쇼핑 몰',
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

const LODGING_SUBTYPES = [
  '게스트하우스',
  '민박집',
  '리조트',
  '펜션',
  '호텔',
  '모텔',
  '민박',
]

const LOCATION_ALIASES = [
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

const LIMITATION_GROUPS = [
  {
    type: 'hours',
    keywords: [
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
    ],
  },
  {
    type: 'price',
    keywords: [
      '입장료',
      '가격',
      '요금',
      '숙박비',
      '이용료',
    ],
  },
  {
    type: 'holiday',
    keywords: ['휴무일', '쉬는 날'],
  },
  {
    type: 'menu',
    keywords: ['대표 메뉴', '상세 메뉴', '메뉴'],
  },
  {
    type: 'reservation',
    keywords: [
      '예약 가능',
      '예약',
      '객실 현황',
    ],
  },
  {
    type: 'parking',
    keywords: ['주차 가능', '주차장', '주차'],
  },
  {
    type: 'weather',
    keywords: ['날씨', '기온', '비 와', '눈 와'],
  },
  {
    type: 'festivalDate',
    keywords: [
      '축제 날짜',
      '축제 일정',
      '정확한 날짜',
      '언제 시작',
      '언제 끝',
      '시작일',
      '종료일',
    ],
  },
  {
    type: 'realtime',
    keywords: ['혼잡도', '실시간'],
  },
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
  '몇개',
  '몇개야',
  '몇곳',
  '몇곳이야',
  '몇군데',
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

const KOREAN_NUMBER_LIMITS = new Map([
  ['한', 1],
  ['두', 2],
  ['세', 3],
  ['네', 4],
  ['다섯', 5],
  ['여섯', 6],
  ['일곱', 7],
  ['여덟', 8],
  ['아홉', 9],
  ['열', 10],
])

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/알려져/g, '알려줘')
    .replace(/번재/g, '번째')
    .replace(/\s+/g, ' ')
}

function includesAny(text, keywords) {
  return keywords.some((keyword) =>
    text.includes(normalizeText(keyword)),
  )
}

function extractCategory(normalizedQuestion) {
  for (const entry of CATEGORY_ALIASES) {
    const sortedAliases = [...entry.aliases].sort(
      (a, b) => b.length - a.length,
    )

    if (
      sortedAliases.some((alias) =>
        normalizedQuestion.includes(normalizeText(alias)),
      )
    ) {
      return entry.category
    }
  }

  return null
}

function extractLodgingSubtype(normalizedQuestion) {
  return [...LODGING_SUBTYPES]
    .sort((a, b) => b.length - a.length)
    .find((subtype) =>
      normalizedQuestion.includes(normalizeText(subtype)),
    ) ?? null
}

function extractLocation(normalizedQuestion) {
  for (const entry of LOCATION_ALIASES) {
    const sortedAliases = [...entry.aliases].sort(
      (a, b) => b.length - a.length,
    )

    if (
      sortedAliases.some((alias) =>
        normalizedQuestion.includes(normalizeText(alias)),
      )
    ) {
      return entry.location
    }
  }

  return null
}

function extractLimitInfo(normalizedQuestion) {
  const numericMatch = normalizedQuestion.match(
    /(\d{1,3})\s*(곳|개|군데)/,
  )

  let requestedLimit = null

  if (numericMatch) {
    requestedLimit = Number(numericMatch[1])
  } else {
    const koreanNumberPattern =
      /(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*(곳|개|군데)/

    const koreanMatch =
      normalizedQuestion.match(koreanNumberPattern)

    if (koreanMatch) {
      requestedLimit =
        KOREAN_NUMBER_LIMITS.get(koreanMatch[1]) ?? null
    }
  }

  if (
    requestedLimit === null ||
    !Number.isFinite(requestedLimit)
  ) {
    return {
      requestedLimit: DEFAULT_LIMIT,
      limit: DEFAULT_LIMIT,
      invalidLimit: false,
      limitWasCapped: false,
      maxLimit: MAX_LIMIT,
    }
  }

  if (requestedLimit <= 0) {
    return {
      requestedLimit,
      limit: 0,
      invalidLimit: true,
      limitWasCapped: false,
      maxLimit: MAX_LIMIT,
    }
  }

  return {
    requestedLimit,
    limit: Math.min(requestedLimit, MAX_LIMIT),
    invalidLimit: false,
    limitWasCapped: requestedLimit > MAX_LIMIT,
    maxLimit: MAX_LIMIT,
  }
}

function isCountRequest(normalizedQuestion) {
  return (
    /몇\s*(개|곳|군데)/.test(normalizedQuestion) ||
    normalizedQuestion.includes('몇개') ||
    normalizedQuestion.includes('몇곳') ||
    normalizedQuestion.includes('몇군데') ||
    normalizedQuestion.includes('개수') ||
    normalizedQuestion.includes('총 몇')
  )
}

function extractLimitationType(normalizedQuestion) {
  for (const group of LIMITATION_GROUPS) {
    if (includesAny(normalizedQuestion, group.keywords)) {
      return group.type
    }
  }

  return null
}

function isCourseRequest(
  normalizedQuestion,
  category,
) {
  const hasClearCourseKeyword = includesAny(
    normalizedQuestion,
    COURSE_KEYWORDS,
  )

  if (!hasClearCourseKeyword) {
    return false
  }

  if (
    category === '여행코스' &&
    !includesAny(normalizedQuestion, [
      '당일치기',
      '데이트',
      '나들이',
      '장소 조합',
      '코스 짜',
      '코스 만들어',
      '코스 만들',
      '코스 구성',
    ])
  ) {
    return false
  }

  return true
}

function determineIntent(
  normalizedQuestion,
  category,
  limitationType,
) {
  if (limitationType) {
    return 'limitation'
  }

  if (isCountRequest(normalizedQuestion)) {
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

function findExactTitleMatches(normalizedQuestion) {
  return allPlaces
    .filter((place) => {
      const normalizedTitle =
        normalizeText(place.title)

      return (
        normalizedTitle.length >= 2 &&
        normalizedQuestion.includes(normalizedTitle)
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

  const limitationKeywords =
    LIMITATION_GROUPS.flatMap(
      (group) => group.keywords,
    )

  return [
    ...categoryAliases,
    ...locationAliases,
    ...LODGING_SUBTYPES,
    ...limitationKeywords,
    ...COURSE_KEYWORDS,
    ...FOLLOW_UP_KEYWORDS,
  ]
    .map(normalizeText)
    .sort((a, b) => b.length - a.length)
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
    '도',
  ]

  let result = token

  for (const particle of particles) {
    if (
      result.length > particle.length + 1 &&
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
  if (exactTitleMatches.length > 0) {
    return []
  }

  let text = removeKnownAliases(
    normalizedQuestion,
  )

  text = text
    .replace(/\d{1,3}\s*(곳|개|군데)/g, ' ')
    .replace(
      /(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*(곳|개|군데)/g,
      ' ',
    )
    .replace(/[?!.,()[\]{}"'`~:;/\\]/g, ' ')
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
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => token.length >= 2)
}

function matchesLocation(place, location) {
  if (!location) {
    return true
  }

  const address =
    place.address ??
    place.addr1 ??
    ''

  return normalizeText(address).includes(
    normalizeText(location),
  )
}

function matchesCategory(place, category) {
  if (!category) {
    return true
  }

  return String(place.contentType) === category
}

function matchesLodgingSubtype(
  place,
  lodgingSubtype,
) {
  if (!lodgingSubtype) {
    return true
  }

  return normalizeText(place.title).includes(
    normalizeText(lodgingSubtype),
  )
}

function matchesImageRequirement(
  place,
  requiresImage,
) {
  if (!requiresImage) {
    return true
  }

  return Boolean(
    place.imageUrl ??
    place.firstimage,
  )
}

function matchesSearchKeywords(
  place,
  keywords,
) {
  if (keywords.length === 0) {
    return true
  }

  const searchableText = normalizeText(
    [
      place.title,
      place.address,
      place.contentType,
    ].join(' '),
  )

  return keywords.every((keyword) =>
    searchableText.includes(keyword),
  )
}

function comparePlacesByImage(a, b) {
  const aHasImage = Boolean(
    a.imageUrl ?? a.firstimage,
  )
  const bHasImage = Boolean(
    b.imageUrl ?? b.firstimage,
  )

  if (aHasImage !== bHasImage) {
    return Number(bHasImage) - Number(aHasImage)
  }

  return String(a.title).localeCompare(
    String(b.title),
    'ko-KR',
  )
}

function sortPlacesByImagePreference(places) {
  return [...places].sort(comparePlacesByImage)
}

function filterPlaces({
  location,
  category,
  lodgingSubtype,
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
      matchesLocation(place, location) &&
      matchesCategory(place, category) &&
      matchesLodgingSubtype(
        place,
        lodgingSubtype,
      ) &&
      matchesSearchKeywords(place, keywords)
    )
  })
}

function findFirstUnselectedPlace(
  candidates,
  categories,
  selectedIds,
) {
  return candidates.find((place) => {
    return (
      categories.includes(place.contentType) &&
      !selectedIds.has(String(place.id))
    )
  })
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

  for (const categories of categoryGroups) {
    if (
      selectedPlaces.length >= targetCount
    ) {
      break
    }

    const place = findFirstUnselectedPlace(
      candidates,
      categories,
      selectedIds,
    )

    if (place) {
      selectedPlaces.push(place)
      selectedIds.add(String(place.id))
    }
  }

  for (const place of candidates) {
    if (
      selectedPlaces.length >= targetCount
    ) {
      break
    }

    const placeId = String(place.id)

    if (!selectedIds.has(placeId)) {
      selectedPlaces.push(place)
      selectedIds.add(placeId)
    }
  }

  return selectedPlaces
}

function createBaseResult({
  intent,
  filters,
  total = 0,
  places = [],
  limitationType = null,
  needsClarification = false,
  clarificationReason = null,
}) {
  return {
    intent,
    filters,
    total,
    places,
    limitationType,
    limitationMessage: null,
    needsClarification,
    clarificationReason,
    subtypeLimited:
      Boolean(filters.lodgingSubtype),
    lodgingSubtype:
      filters.lodgingSubtype,
    subtypeNotice:
      filters.lodgingSubtype
        ? '현재 데이터에는 숙박 세부 유형 필드가 없어 장소명 포함 여부를 기준으로 검색했습니다.'
        : null,
    invalidLimit:
      filters.invalidLimit,
    requestedLimit:
      filters.requestedLimit,
    limitWasCapped:
      filters.limitWasCapped,
    maxLimit:
      filters.maxLimit,
  }
}

export function searchPlacesFromQuestion(
  question,
  previousFilters = null,
) {
  const normalizedQuestion =
    normalizeText(question)

  const explicitLodgingSubtype =
    extractLodgingSubtype(
      normalizedQuestion,
    )

  const explicitCategory =
    extractCategory(
      normalizedQuestion,
    )

  const explicitLocation =
    extractLocation(
      normalizedQuestion,
    )

  const isFollowUp = includesAny(
    normalizedQuestion,
    FOLLOW_UP_KEYWORDS,
  )

  const lodgingSubtype =
    explicitLodgingSubtype ??
    (
      isFollowUp
        ? previousFilters?.lodgingSubtype ?? null
        : null
    )

  const category =
    explicitCategory ??
    (
      explicitLodgingSubtype
        ? '숙박'
        : (
          isFollowUp
            ? previousFilters?.category ?? null
            : null
        )
    )

  const location =
    explicitLocation ??
    (
      isFollowUp
        ? previousFilters?.location ?? null
        : null
    )

  const explicitlyRequiresImage =
    normalizedQuestion.includes('사진') ||
    normalizedQuestion.includes('이미지')

  const requiresImage =
    explicitlyRequiresImage ||
    (
      isFollowUp &&
      Boolean(previousFilters?.requiresImage)
    )

  const limitInfo =
    extractLimitInfo(
      normalizedQuestion,
    )

  const limitationType =
    extractLimitationType(
      normalizedQuestion,
    )

  const intent = determineIntent(
    normalizedQuestion,
    category,
    limitationType,
  )

  const exactTitleMatches =
    findExactTitleMatches(
      normalizedQuestion,
    )

  const filters = {
    location,
    category,
    lodgingSubtype,
    requiresImage,
    isFollowUp,
    ...limitInfo,
  }

  if (
    isFollowUp &&
    !previousFilters &&
    !explicitCategory &&
    !explicitLocation &&
    !explicitLodgingSubtype &&
    exactTitleMatches.length === 0
  ) {
    return createBaseResult({
      intent,
      filters,
      needsClarification: true,
      clarificationReason:
        'FOLLOW_UP_WITHOUT_CONTEXT',
    })
  }

  if (filters.invalidLimit) {
    return createBaseResult({
      intent,
      filters,
    })
  }

  if (intent === 'limitation') {
    const limitationPlaces =
      sortPlacesByImagePreference(
        exactTitleMatches.filter((place) =>
          matchesImageRequirement(
            place,
            requiresImage,
          ),
        ),
      ).slice(0, filters.limit)

    return createBaseResult({
      intent,
      filters,
      total: exactTitleMatches.length,
      places: limitationPlaces,
      limitationType,
    })
  }

  if (intent === 'course') {
    if (!location) {
      return createBaseResult({
        intent,
        filters,
        needsClarification: true,
        clarificationReason:
          'COURSE_LOCATION_REQUIRED',
      })
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

    return createBaseResult({
      intent,
      filters,
      total: courseCandidates.length,
      places: selectCoursePlaces(
        courseCandidates,
        filters.limit,
      ),
    })
  }

  const keywords =
    intent === 'count' || isFollowUp
      ? []
      : extractSearchKeywords(
          normalizedQuestion,
          exactTitleMatches,
        )

  const filteredPlaces =
    sortPlacesByImagePreference(
      filterPlaces({
        location,
        category,
        lodgingSubtype,
        requiresImage,
        keywords,
        exactTitleMatches,
      }),
    )

  return createBaseResult({
    intent,
    filters,
    total: filteredPlaces.length,
    places:
      intent === 'count'
        ? []
        : filteredPlaces.slice(
            0,
            filters.limit,
          ),
  })
}