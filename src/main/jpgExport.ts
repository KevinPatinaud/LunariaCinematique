import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

interface Session { directory: string; count: number; next: number; title: string }

export function safeJpgTitle(value: string): string {
  const title = value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100).replace(/[. ]+$/g, '');
  return title || 'Cinématique';
}

export function jpgFrameName(index: number, count: number, title: string): string {
  return `${String(index).padStart(Math.max(2, String(count).length), '0')} - ${safeJpgTitle(title)}.jpg`;
}

export class JpgExports {
  private sessions = new Map<string, Session>();

  async begin(parent: string, title: string, count: number): Promise<{ id: string; path: string }> {
    if (!path.isAbsolute(parent) || typeof title !== 'string' || title.length > 200 || !Number.isInteger(count) || count < 1 || count > 500) throw new Error('Demande d’export JPG invalide.');
    const base = `${safeJpgTitle(title)} - JPG`;
    let directory = '';
    for (let suffix = 1; suffix <= 1000; suffix++) {
      directory = path.join(parent, suffix === 1 ? base : `${base} (${suffix})`);
      try { await fs.mkdir(directory); break; }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || suffix === 1000) throw error; }
    }
    const id = randomUUID();
    this.sessions.set(id, { directory, count, next: 1, title });
    return { id, path: directory };
  }

  async write(id: string, index: number, dataUrl: string): Promise<void> {
    const session = this.sessions.get(id);
    if (!session || index !== session.next || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/jpeg;base64,')) throw new Error('Image JPG ou ordre d’export invalide.');
    const encoded = dataUrl.slice('data:image/jpeg;base64,'.length);
    if (encoded.length > 20 * 1024 * 1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error('Image JPG invalide ou trop volumineuse.');
    const bytes = Buffer.from(encoded, 'base64');
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) throw new Error('Fichier JPG invalide.');
    await fs.writeFile(path.join(session.directory, jpgFrameName(index, session.count, session.title)), bytes, { flag: 'wx' });
    session.next++;
  }

  finish(id: string): string {
    const session = this.sessions.get(id);
    if (!session || session.next !== session.count + 1) throw new Error('Export JPG incomplet.');
    this.sessions.delete(id);
    return session.directory;
  }

  async cancel(id: string): Promise<void> {
    const session = this.sessions.get(id);
    if (!session) return;
    this.sessions.delete(id);
    await fs.rm(session.directory, { recursive: true, force: true });
  }
}
