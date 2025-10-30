import { getCollection, type CollectionEntry } from 'astro:content'

/**
 * Get all posts, filtering out posts whose filenames start with _
 */
export async function getFilteredPosts() {
  const posts = await getCollection('posts')
  return posts.filter((post: CollectionEntry<'posts'>) => !post.id.startsWith('_'))
}

/**
 * Get all posts sorted by publication date, filtering out posts whose filenames start with _
 */
export async function getSortedFilteredPosts() {
  const posts = await getFilteredPosts()
  return posts.sort(
    (a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) =>
      b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )
}

/**
 * Get related posts based on tag similarity
 * @param currentPostId - The ID of the current post to exclude from results
 * @param currentTags - The tags of the current post
 * @param limit - Maximum number of related posts to return (default: 10)
 */
export async function getRelatedPosts(
  currentPostId: string,
  currentTags: string[] = [],
  limit = 10
) {
  const posts = await getSortedFilteredPosts()

  // Filter out current post and posts without any tags
  const candidatePosts = posts.filter(
    (post) => post.id !== currentPostId && post.data.tags && post.data.tags.length > 0
  )

  // Calculate tag overlap for each post
  const postsWithSimilarity = candidatePosts.map((post) => {
    const postTags = post.data.tags || []
    const commonTags = postTags.filter((tag) => currentTags.includes(tag))
    return {
      post,
      similarityScore: commonTags.length
    }
  })

  // Filter to only posts with at least one common tag, sort by similarity, then by date
  const relatedPosts = postsWithSimilarity
    .filter((item) => item.similarityScore > 0)
    .sort((a, b) => {
      // First sort by similarity score (more overlap = higher)
      if (b.similarityScore !== a.similarityScore) {
        return b.similarityScore - a.similarityScore
      }
      // If same similarity, sort by date (newer first)
      return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf()
    })
    .slice(0, limit)
    .map((item) => item.post)

  return relatedPosts
}
