import normalizePlace from '../utils/normalizePlace.js'

import tourism from '../data/대전_충청권_관광지.json'
import restaurants from '../data/대전_충청권_음식점.json'
import cultural from '../data/대전_충청권_문화시설.json'
import lodging from '../data/대전_충청권_숙박.json'
import shopping from '../data/대전_충청권_쇼핑.json'
import leisure from '../data/대전_충청권_레포츠.json'
import courses from '../data/대전_충청권_여행코스.json'
import festivals from '../data/대전_충청권_축제공연행사.json'

const placeDataSources = [
  tourism,
  restaurants,
  cultural,
  lodging,
  shopping,
  leisure,
  courses,
  festivals,
]

function normalizeItems(data) {
  if (!data || !Array.isArray(data.items)) {
    return []
  }

  return data.items.map((item) =>
    normalizePlace(item, data.contentType),
  )
}

export const allPlaces = placeDataSources.flatMap(normalizeItems)

export const placeCategories = [
  '관광지',
  '음식점',
  '문화시설',
  '숙박',
  '쇼핑',
  '레포츠',
  '여행코스',
  '축제공연행사',
]