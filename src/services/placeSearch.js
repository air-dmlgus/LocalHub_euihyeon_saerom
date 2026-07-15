import { allPlaces } from './placeData.js'

const DEFAULT_LIMIT = 5
const MAX_LIMIT = 10
const COURSE_PLACE_COUNT = 3

const LIMITATION_MESSAGE =
  '현재 LocalHub 데이터에는 운영시간, 가격, 휴무일, 메뉴, 정확한 축제 일정 등의 정보가 없어 확인할 수 없습니다. 장소명, 주소, 지역, 콘텐츠 유형은 안내할 수 있습니다.'

const CATEGORY_ALIASES = [
  {
    category: '축제공연행사',
    aliases: ['축제공연행사', '축제 공연 행사', '축제', '행사', '공연'],
  },
  {
    category: '여행코스',
    aliases: ['여행코스', '여행 코스'],
  },
  {
    category: '문화시설',
    aliases: ['문화시설', '문화 시설', '박물관', '미술관'],
  },
  {
    category: '음식점',
    aliases: ['음식점', '맛집', '식당', '카페'],
  },
  {
    category: '관광지',
    aliases: ['관광지', '명소', '볼거리'],
  },
  {
    category: '숙박',
    aliases: ['숙박', '숙소', '호텔', '펜션'],
  },
  {
    category: '쇼핑',
    aliases: ['쇼핑', '시장'],
  },
  {
    category: '레포츠',
    aliases: ['레포츠', '체험', '운동'],
  },
]

const LOCATION_ALIASES = [
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
  {
    location: '충청도',
    aliases: ['충청도', '충청권', '충청 지역'],
  },
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
]

const LIMITATION_KEYWORDS = [
  '운영시간', '운영 시간', '영업시간', '영업 시간',
  '오늘 영업', '문 열', '문 닫', '몇 시', '몇시',
  '오픈 시간', '마감 시간', '입장료', '가격', '요금',
  '휴무일', '메뉴', '예약', '주차', '혼잡도', '날씨',
  '축제 날짜', '축제 일정', '언제 시작',
]

const COURSE_KEYWORDS = [
  '당일치기', '데이트', '나들이', '장소 조합',
  '코스 추천', '코스 짜', '코스 만들어',
  '코스 만들', '코스 구성',
]

const STOP_WORDS = new Set([
  '알려줘', '알려주세요', '알려',
  '찾아줘', '찾아주세요', '찾아',
  '추천해줘', '추천해주세요', '추천',
  '보여줘', '보여주세요', '보여',
  '소개해줘', '소개해주세요', '소개',
  '어디', '어디야', '어디에',
  '위치', '주소', '어떤', '뭐야', '무엇',
  '장소', '지역', '정보',
  '있어', '있나요', '있니',
  '해주세요', '해줘', '부탁해', '부탁',
  '좀', '가볼만한', '갈만한',
  '가볼', '갈', '만한', '있는', '있고',
  '전체', '총', '몇',
  '몇개', '몇개야', '몇곳', '몇곳이야',
  '몇군데', '개수', '곳', '군데', '개',
  '사진', '이미지',
  '에서', '에는', '으로', '에', '의',
  '은', '는', '이', '가', '을', '를',
  '도', '와', '과', '요',
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

function extractCategory(normalizedQuestion) {
  for (const entry of CATEGORY_ALIASES) {
    const aliases = [...entry.aliases].sort(
      (a, b) => b.length - a.length,
    )

    if (
      aliases.some((alias) =>
        normalizedQuestion.includes(normalizeText(alias)),
      )
    ) {
      return entry.category
    }
  }

  return null
}

function extractLocation(normalizedQuestion) {
  for (const entry of LOCATION_ALIASES) {
    const aliases = [...entry.aliases].sort(
      (a, b) => b.length - a.length,
    )

    if (
      aliases.some((alias) =>
        normalizedQuestion.includes(normalizeText(alias)),
      )
    ) {
      return entry.location
    }
  }

  return null
}

function extractLimit(normalizedQuestion) {
  const match = normalizedQuestion.match(
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

function isCountRequest(normalizedQuestion) {
  return (
    /몇\s*(개|곳|군데)/.test(normalizedQuestion) ||
    normalizedQuestion.includes('개수') ||
    normalizedQuestion.includes('총 몇')
  )
}

function isCourseRequest(normalizedQuestion, category) {
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

function determineIntent(normalizedQuestion, category) {
  if (
    includesAny(
      normalizedQuestion,
      LIMITATION_KEYWORDS,
    )
  ) {
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
      const normalizedTitle = normalizeText(place.title)

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

  return [
    ...categoryAliases,
    ...locationAliases,
    ...LIMITATION_KEYWORDS,
    ...COURSE_KEYWORDS,
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
    '에서', '에는', '으로', '까지', '부터',
    '에게', '한테', '에', '의', '은', '는',
    '이', '가', '을', '를', '도', '와', '과',
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

function removeCountExpressions(text) {
  return text
    .replace(
      /총\s*몇\s*(개|곳|군데)?\s*(이야|야|예요|이에요|인가요|인가|나요|니|입니까)?/g,
      ' ',
    )
    .replace(
      /몇\s*(개|곳|군데)\s*(이야|야|예요|이에요|인가요|인가|나요|니|입니까)?/g,
      ' ',
    )
    .replace(
      /개수\s*(는|가|를|도)?\s*(이야|야|예요|이에요|인가요|인가|나요|니|입니까)?/g,
      ' ',
    )
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

  text = removeCountExpressions(text)

  text = text
    .replace(/\d{1,2}\s*(곳|개|군데)/g, ' ')
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

  const address = normalizeText(place.address)

  if (location === '충청도') {
    return (
      address.includes('충청남도') ||
      address.includes('충청북도')
    )
  }

  return address.includes(
    normalizeText(location),
  )
}

function matchesCategory(place, category) {
  if (!category) {
    return true
  }

  return String(place.contentType) === category
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
  category,
) {
  if (keywords.length === 0) {
    return true
  }

  const normalizedTitle =
    normalizeText(place.title)

  const searchableText = normalizeText(
    [
      place.title,
      place.address,
      place.contentType,
    ].join(' '),
  )

  let remainingKeywords = keywords

  /*
   * 현재 데이터에는 공원 전용 카테고리가 없습니다.
   * 별도 카테고리 없이 공원을 검색하면 관광지 중
   * 제목에 '공원'이 들어간 장소만 검색합니다.
   */
  if (
    !category &&
    keywords.includes('공원')
  ) {
    if (
      place.contentType !== '관광지' ||
      !normalizedTitle.includes('공원')
    ) {
      return false
    }

    remainingKeywords = keywords.filter(
      (keyword) => keyword !== '공원',
    )
  }

  return remainingKeywords.every(
    (keyword) =>
      searchableText.includes(keyword),
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
      matchesLocation(place, location) &&
      matchesCategory(place, category) &&
      matchesSearchKeywords(
        place,
        keywords,
        category,
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
      categories.includes(place.contentType) &&
      !selectedIds.has(String(place.id)),
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

export function searchPlacesFromQuestion(
  question,
) {
  const normalizedQuestion =
    normalizeText(question)

  const category =
    extractCategory(normalizedQuestion)

  const location =
    extractLocation(normalizedQuestion)

  const requiresImage =
    normalizedQuestion.includes('사진') ||
    normalizedQuestion.includes('이미지')

  const limit =
    extractLimit(normalizedQuestion)

  const intent =
    determineIntent(
      normalizedQuestion,
      category,
    )

  const exactTitleMatches =
    findExactTitleMatches(
      normalizedQuestion,
    )

  const filters = {
    location,
    category,
    requiresImage,
    limit,
  }

  if (intent === 'limitation') {
    const limitationPlaces =
      exactTitleMatches
        .filter((place) =>
          matchesImageRequirement(
            place,
            requiresImage,
          ),
        )
        .slice(0, limit)

    return {
      intent,
      filters,
      total: exactTitleMatches.length,
      places: limitationPlaces,
      limitationMessage: LIMITATION_MESSAGE,
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
      )

    return {
      intent,
      filters,
      total: courseCandidates.length,
      places: selectCoursePlaces(
        courseCandidates,
        limit,
      ),
      limitationMessage: null,
      needsClarification: false,
    }
  }

  /*
   * count 질문에서도 '공원' 같은 핵심 검색어는 유지합니다.
   * 대신 '몇 개야', '개수는' 같은 표현만 제거합니다.
   */
  const keywords =
    extractSearchKeywords(
      normalizedQuestion,
      exactTitleMatches,
    )

  const filteredPlaces = filterPlaces({
    location,
    category,
    requiresImage,
    keywords,
    exactTitleMatches,
  })

  return {
    intent,
    filters,
    total: filteredPlaces.length,
    places: filteredPlaces.slice(0, limit),
    limitationMessage: null,
    needsClarification: false,
  }
}