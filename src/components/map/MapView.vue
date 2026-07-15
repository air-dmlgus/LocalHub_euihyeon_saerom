<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import L from 'leaflet'

const props = defineProps({
  places: { type: Array, default: () => [] }, // { id, title, latitude, longitude, address, ... }
  center: { type: Object, default: () => ({ lat: 36.3504, lng: 127.3845 }) },
  zoom: { type: Number, default: 11 },
  showMarkers: { type: Boolean, default: true }
})

const mapContainer = ref(null)
let map = null
let markersLayer = null
let smallIcon = null

onMounted(() => {
  map = L.map(mapContainer.value, { zoomControl: true }).setView([props.center.lat, props.center.lng], props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // 한국 영역으로 제한 (필요 시 숫자 조정)
  const koreaBounds = L.latLngBounds([[32.0, 124.0], [44.0, 132.5]])
  map.setMaxBounds(koreaBounds)
  map.on('drag', () => {
    if (!koreaBounds.contains(map.getCenter())) map.panInsideBounds(koreaBounds)
  })
  map.setMinZoom(6)

  markersLayer = L.layerGroup().addTo(map)

  // 작은 핀 아이콘 (divIcon 사용)
  smallIcon = L.divIcon({
    className: 'small-pin',
    html: '<span></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 14],
    popupAnchor: [0, -10]
  })

  updateMarkers(props.places)
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.places, (newVal) => {
  updateMarkers(newVal)
}, { deep: true })

watch(() => props.showMarkers, (val) => {
  if (!markersLayer) return
  if (!val) markersLayer.clearLayers()
  else updateMarkers(props.places)
})

function updateMarkers(list = []) {
  if (!markersLayer) return
  markersLayer.clearLayers()
  if (!props.showMarkers) return

  const added = []

  list.forEach(p => {
    if (!p) return
    const lat = p.latitude ?? p.lat ?? p.mapy
    const lng = p.longitude ?? p.lng ?? p.mapx
    if (lat == null || lng == null) return
    const marker = L.marker([Number(lat), Number(lng)], { icon: smallIcon })
      .bindPopup(`<div style="min-width:160px"><strong>${escapeHtml(p.title || p.name || '')}</strong><br/><small>${escapeHtml(p.address || p.addr1 || '')}</small></div>`)
    marker.addTo(markersLayer)
    added.push(marker)
  })

  if (!map) return

  if (added.length === 1) {
    map.setView(added[0].getLatLng(), 15)
  } else if (added.length > 1) {
    const group = L.featureGroup(added)
    map.fitBounds(group.getBounds().pad(0.15))
  } else {
    map.setView([props.center.lat, props.center.lng], props.zoom)
  }

}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]))
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 320px; /* 필요하면 값 조절 */
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

/* 작은 핀 스타일
   참고: scoped일 때 Leaflet이 만든 DOM에는 scope attribute가 없어 적용이 안 될 수 있습니다.
   효과가 없으면 이 CSS를 src/style.css 같은 전역 파일로 옮기거나 <style>에서 scoped를 제거하세요.
*/
.small-pin span {
  display:block;
  width:10px;
  height:10px;
  background:#0ea5a4;
  border-radius:50%;
  border:2px solid #fff;
  box-shadow:0 1px 3px rgba(0,0,0,0.15);
}
</style>