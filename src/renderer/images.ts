/** Bounded, deduplicated image decode cache. Source URLs include library identity and file revision. */
export class ImageCache {
  private values = new Map<string, Promise<HTMLImageElement>>();
  constructor(private readonly limit = 24) {}
  load(url: string, name: string): Promise<HTMLImageElement> {
    const cached = this.values.get(url); if (cached) return cached;
    let promise: Promise<HTMLImageElement>;
    const evict = () => { if (this.values.get(url) === promise) this.values.delete(url); };
    promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      const fail = (message: string) => { clearTimeout(timer); image.onload = null; image.onerror = null; image.src = ''; evict(); reject(new Error(message)); };
      const timer = setTimeout(() => fail(`Chargement trop long : ${name}`), 15000);
      image.onerror = () => fail(`Image illisible : ${name}`);
      image.onload = () => {
        clearTimeout(timer); image.onload = null; image.onerror = null;
        if (!image.naturalWidth || !image.naturalHeight) { fail(`Dimensions invalides : ${name}`); return; }
        if (image.naturalWidth * image.naturalHeight > 64 * 1024 * 1024) { fail(`Image trop grande pour l’aperçu : ${name} (64 mégapixels maximum).`); return; }
        resolve(image);
      };
      image.src = url;
    });
    if (this.values.size >= this.limit) this.values.delete(this.values.keys().next().value!);
    this.values.set(url, promise); return promise;
  }
  clear() { this.values.clear(); }
}
