import type { D1Database } from '@cloudflare/workers-types';
import { nanoid } from 'nanoid';

// Cloudflare Workers doesn't support bcrypt, so we'll use Web Crypto API
export class Auth {
  constructor(private db: D1Database) {}

  // Hash password using Web Crypto API (PBKDF2)
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    const saltArray = Array.from(salt);
    
    // Combine salt and hash, encode as base64
    const combined = [...saltArray, ...hashArray];
    return btoa(String.fromCharCode(...combined));
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const combined = atob(hashedPassword);
      const bytes = new Uint8Array(combined.length);
      for (let i = 0; i < combined.length; i++) {
        bytes[i] = combined.charCodeAt(i);
      }

      const salt = bytes.slice(0, 16);
      const storedHash = bytes.slice(16);

      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
      );

      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        256
      );

      const derivedHash = new Uint8Array(derivedBits);

      // Compare hashes
      if (derivedHash.length !== storedHash.length) return false;
      
      let match = true;
      for (let i = 0; i < derivedHash.length; i++) {
        if (derivedHash[i] !== storedHash[i]) {
          match = false;
        }
      }
      return match;
    } catch (error) {
      return false;
    }
  }

  // Create user
  async createUser(username: string, email: string, password: string, role: 'admin' | 'editor' | 'viewer' = 'admin'): Promise<number> {
    const passwordHash = await this.hashPassword(password);
    
    const result = await this.db
      .prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .bind(username, email, passwordHash, role)
      .run();
    
    return result.meta.last_row_id;
  }

  // Authenticate user
  async authenticate(username: string, password: string): Promise<{ id: number; username: string; email: string; role: string } | null> {
    const user = await this.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first() as any;

    if (!user) return null;

    const isValid = await this.verifyPassword(password, user.password_hash);
    if (!isValid) return null;

    // Update last login
    await this.db
      .prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(user.id)
      .run();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  // Create session
  async createSession(userId: number): Promise<string> {
    const sessionId = nanoid(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await this.db
      .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(sessionId, userId, expiresAt)
      .run();

    return sessionId;
  }

  // Get session
  async getSession(sessionId: string): Promise<{ userId: number; username: string; role: string } | null> {
    const session = await this.db
      .prepare(`
        SELECT s.user_id, u.username, u.role
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.expires_at > datetime('now')
      `)
      .bind(sessionId)
      .first() as any;

    if (!session) return null;

    return {
      userId: session.user_id,
      username: session.username,
      role: session.role,
    };
  }

  // Delete session (logout)
  async deleteSession(sessionId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE id = ?')
      .bind(sessionId)
      .run();
  }

  // Clean expired sessions
  async cleanExpiredSessions(): Promise<void> {
    await this.db
      .prepare("DELETE FROM sessions WHERE expires_at < datetime('now')")
      .run();
  }

  // Get user by ID
  async getUserById(id: number): Promise<{ id: number; username: string; email: string; role: string } | null> {
    const user = await this.db
      .prepare('SELECT id, username, email, role FROM users WHERE id = ?')
      .bind(id)
      .first() as any;

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}

// Helper to get session from cookie
export function getSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  
  if (!sessionCookie) return null;
  
  return sessionCookie.split('=')[1];
}

// Helper to create session cookie
export function createSessionCookie(sessionId: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  return `session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}; Path=/`;
}

// Helper to clear session cookie
export function clearSessionCookie(): string {
  return 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/';
}
