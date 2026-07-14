import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import PlacesView from '../views/PlacesView.vue'
import CommunityListView from '../views/CommunityListView.vue'
import CommunityFormView from '../views/CommunityFormView.vue'
import CommunityDetailView from '../views/CommunityDetailView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/places',
    name: 'Places',
    component: PlacesView,
  },
  {
    path: '/community',
    name: 'CommunityList',
    component: CommunityListView,
  },
  {
    path: '/community/new',
    name: 'CommunityNew',
    component: CommunityFormView,
  },
  {
    path: '/community/:id',
    name: 'CommunityDetail',
    component: CommunityDetailView,
    props: true,
  },
  {
    path: '/community/:id/edit',
    name: 'CommunityEdit',
    component: CommunityFormView,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router