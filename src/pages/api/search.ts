import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals, url }) => {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const query = url.searchParams.get('q');
  
  if (!query || query.trim().length === 0) {
    return new Response(JSON.stringify({ posts: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Use FTS5 full-text search
    const results = await runtime.env.DB
      .prepare(`
        SELECT p.id, p.title, p.slug, p.excerpt, p.author, p.published_date, p.featured_image,
               snippet(posts_fts, 1, '<mark>', '</mark>', '...', 32) as snippet
        FROM posts_fts
        JOIN posts p ON posts_fts.rowid = p.id
        WHERE posts_fts MATCH ? AND p.status = 'published'
        ORDER BY rank
        LIMIT 20
      `)
      .bind(query)
      .all();

    return new Response(
      JSON.stringify({ 
        posts: results.results,
        count: results.results?.length || 0,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Fallback to LIKE search if FTS fails
    try {
      const likeQuery = `%${query}%`;
      const results = await runtime.env.DB
        .prepare(`
          SELECT id, title, slug, excerpt, author, published_date, featured_image
          FROM posts
          WHERE (title LIKE ? OR content LIKE ? OR excerpt LIKE ?) AND status = 'published'
          ORDER BY published_date DESC
          LIMIT 20
        `)
        .bind(likeQuery, likeQuery, likeQuery)
        .all();

      return new Response(
        JSON.stringify({ 
          posts: results.results,
          count: results.results?.length || 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (fallbackError) {
      return new Response(JSON.stringify({ error: 'Search failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
};
