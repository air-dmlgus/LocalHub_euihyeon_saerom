export default function normalizePlace(item, contentType) {
  const id = String(item.contentid ?? '')
  const contentTypeId = String(item.contenttypeid ?? '')

  const rawTitle = String(item.title ?? '').trim()
  const title = rawTitle || '이름 정보 없음'

  const addr1 = String(item.addr1 ?? '').trim()
  const addr2 = String(item.addr2 ?? '').trim()

  const address =
    [addr1, addr2].filter(Boolean).join(' ') || '주소 정보 없음'

  const tel = String(item.tel ?? '').trim()

  const latitudeText = String(item.mapy ?? '').trim()
  const longitudeText = String(item.mapx ?? '').trim()

  const parsedLatitude =
    latitudeText === '' ? null : Number(latitudeText)

  const parsedLongitude =
    longitudeText === '' ? null : Number(longitudeText)

  const hasCoordinates =
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude)

  const rawImage = String(
    item.firstimage || item.firstimage2 || '',
  ).trim()

  const imageUrl = rawImage
    ? rawImage.replace(
        /^http:\/\/tong\.visitkorea\.or\.kr/i,
        'https://tong.visitkorea.or.kr',
      )
    : null

  return {
    id,
    contentType: String(contentType ?? ''),
    contentTypeId,
    title,
    address,
    tel,
    latitude: hasCoordinates ? parsedLatitude : null,
    longitude: hasCoordinates ? parsedLongitude : null,
    imageUrl,
    hasCoordinates,
  }
}