// 브라우저 localStorage를 이용한 게시글 관리
const STORAGE_KEY = 'localhub_posts_v1'
const LIKED_POSTS_KEY = 'localhub_liked_posts'
const REPORTED_POSTS_KEY = 'localhub_reported_posts'

export function loadPosts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function savePosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  } catch {
    console.error('Failed to save posts')
  }
}

export function addPost(post) {
  const posts = loadPosts()
  const newPost = {
    id: crypto.randomUUID(),
    ...post,
    image: post.image || null,
    likes: 0,
    comments: [],
    reportCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  posts.unshift(newPost)
  savePosts(posts)
  return newPost
}

export function getPostById(id) {
  const posts = loadPosts()
  return posts.find((post) => post.id === id)
}

export function updatePost(id, data) {
  const posts = loadPosts()
  const index = posts.findIndex((post) => post.id === id)
  if (index === -1) return null

  posts[index] = {
    ...posts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  savePosts(posts)
  return posts[index]
}

export function deletePost(id) {
  console.log('🗑️ deletePost 시작:', id)
  const posts = loadPosts()
  console.log('📋 현재 게시물 수:', posts.length, '게시물:', posts)
  
  const newPosts = posts.filter((post) => post.id !== id)
  console.log('✂️ 삭제 후 게시물 수:', newPosts.length, '게시물:', newPosts)
  
  savePosts(newPosts)
  console.log('💾 저장 완료')
  return true
}

export function toggleLike(postId) {
  const posts = loadPosts()
  const post = posts.find((p) => p.id === postId)
  if (!post) return 0

  try {
    const likedPosts = JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
    const index = likedPosts.indexOf(postId)

    if (index > -1) {
      likedPosts.splice(index, 1)
      post.likes = Math.max(0, post.likes - 1)
    } else {
      likedPosts.push(postId)
      post.likes += 1
    }

    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(likedPosts))
    savePosts(posts)
    return post.likes
  } catch {
    return post.likes
  }
}

export function getLikedPosts() {
  try {
    return JSON.parse(localStorage.getItem(LIKED_POSTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function addComment(postId, commentText, password = null) {
  const posts = loadPosts()
  const post = posts.find((p) => p.id === postId)
  if (!post) return null

  const anonymousNumber = ((post.comments && post.comments.length) || 0) % 100 + 1
  const newComment = {
    id: crypto.randomUUID(),
    text: commentText,
    anonymousNumber,
    createdAt: new Date().toISOString(),
    password: password ? String(password) : null,
  }

  post.comments = post.comments || []
  post.comments.push(newComment)
  savePosts(posts)
  return newComment
}

export function deleteComment(postId, commentId, password = null) {
  const posts = loadPosts()
  const post = posts.find((p) => p.id === postId)
  if (!post || !post.comments) return false

  const index = post.comments.findIndex((c) => c.id === commentId)
  if (index === -1) return false

  const comment = post.comments[index]

  if (comment.password) {
    if (!password) return false
    if (String(password) !== String(comment.password)) return false
  } else {
    // 기존(비밀번호 없는) 댓글은 삭제 불가
    return false
  }

  post.comments.splice(index, 1)
  savePosts(posts)
  return true
}

export function reportPost(postId) {
  const posts = loadPosts()
  const post = posts.find((p) => p.id === postId)
  if (!post) return 0

  try {
    const reportedPosts = JSON.parse(localStorage.getItem(REPORTED_POSTS_KEY) || '[]')
    if (!reportedPosts.includes(postId)) {
      reportedPosts.push(postId)
      localStorage.setItem(REPORTED_POSTS_KEY, JSON.stringify(reportedPosts))
    }

    post.reportCount = (post.reportCount || 0) + 1
    savePosts(posts)
    return post.reportCount
  } catch {
    return post.reportCount
  }
}

export function getReportedPosts() {
  try {
    return JSON.parse(localStorage.getItem(REPORTED_POSTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function getHotPosts() {
  const posts = loadPosts()
  const reported = getReportedPosts()
  return posts
    .filter((post) => post.likes >= 5 && !reported.includes(post.id))
    .sort((a, b) => b.likes - a.likes)
}