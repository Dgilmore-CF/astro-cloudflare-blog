import type { D1Database } from '@cloudflare/workers-types';

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author: string;
  published_date: string;
  updated_date?: string;
  status: 'draft' | 'published';
  views: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export class BlogDB {
  constructor(private db: D1Database) {}

  // Post operations
  async getPosts(status: 'draft' | 'published' | 'all' = 'published', limit = 10, offset = 0): Promise<Post[]> {
    let query = 'SELECT * FROM posts';
    const params: string[] = [];
    
    if (status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY published_date DESC LIMIT ? OFFSET ?';
    params.push(String(limit), String(offset));
    
    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as Post[];
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    const result = await this.db
      .prepare('SELECT * FROM posts WHERE slug = ?')
      .bind(slug)
      .first();
    return result as Post | null;
  }

  async getPostById(id: number): Promise<Post | null> {
    const result = await this.db
      .prepare('SELECT * FROM posts WHERE id = ?')
      .bind(id)
      .first();
    return result as Post | null;
  }

  async createPost(post: Omit<Post, 'id' | 'created_at' | 'views'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO posts (title, slug, content, excerpt, featured_image, author, published_date, updated_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        post.title,
        post.slug,
        post.content,
        post.excerpt || null,
        post.featured_image || null,
        post.author,
        post.published_date,
        post.updated_date || null,
        post.status
      )
      .run();
    
    return result.meta.last_row_id;
  }

  async updatePost(id: number, post: Partial<Post>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (post.title) { fields.push('title = ?'); values.push(post.title); }
    if (post.slug) { fields.push('slug = ?'); values.push(post.slug); }
    if (post.content) { fields.push('content = ?'); values.push(post.content); }
    if (post.excerpt !== undefined) { fields.push('excerpt = ?'); values.push(post.excerpt); }
    if (post.featured_image !== undefined) { fields.push('featured_image = ?'); values.push(post.featured_image); }
    if (post.author) { fields.push('author = ?'); values.push(post.author); }
    if (post.published_date) { fields.push('published_date = ?'); values.push(post.published_date); }
    if (post.updated_date !== undefined) { fields.push('updated_date = ?'); values.push(post.updated_date); }
    if (post.status) { fields.push('status = ?'); values.push(post.status); }
    
    if (fields.length === 0) return;
    
    const query = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    
    await this.db.prepare(query).bind(...values).run();
  }

  async deletePost(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  }

  async incrementViews(id: number): Promise<void> {
    await this.db
      .prepare('UPDATE posts SET views = views + 1 WHERE id = ?')
      .bind(id)
      .run();
  }

  // Tag operations
  async getTags(): Promise<Tag[]> {
    const result = await this.db
      .prepare('SELECT * FROM tags ORDER BY name')
      .all();
    return result.results as Tag[];
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    const result = await this.db
      .prepare('SELECT * FROM tags WHERE slug = ?')
      .bind(slug)
      .first();
    return result as Tag | null;
  }

  async createTag(name: string, slug: string): Promise<number> {
    const result = await this.db
      .prepare('INSERT INTO tags (name, slug) VALUES (?, ?)')
      .bind(name, slug)
      .run();
    return result.meta.last_row_id;
  }

  async getPostTags(postId: number): Promise<Tag[]> {
    const result = await this.db
      .prepare(`
        SELECT t.* FROM tags t
        INNER JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = ?
      `)
      .bind(postId)
      .all();
    return result.results as Tag[];
  }

  async addTagToPost(postId: number, tagId: number): Promise<void> {
    await this.db
      .prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)')
      .bind(postId, tagId)
      .run();
  }

  // Comment operations
  async getCommentsByPostId(postId: number, status: 'pending' | 'approved' | 'rejected' | 'all' = 'approved'): Promise<Comment[]> {
    let query = 'SELECT * FROM comments WHERE post_id = ?';
    const params: any[] = [postId];
    
    if (status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.db.prepare(query).bind(...params).all();
    return result.results as Comment[];
  }

  async createComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<number> {
    const result = await this.db
      .prepare(`
        INSERT INTO comments (post_id, author_name, author_email, content, status)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        comment.post_id,
        comment.author_name,
        comment.author_email,
        comment.content,
        comment.status
      )
      .run();
    return result.meta.last_row_id;
  }
}
