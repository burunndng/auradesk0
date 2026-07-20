class RequestQueue {
  private queue: Array<{ fn: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void }> = [];
  private processing = false;
  private isOnline = true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.process();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (this.isOnline) this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0 || !this.isOnline) return;

    this.processing = true;

    while (this.queue.length > 0 && this.isOnline) {
      const { fn, resolve, reject } = this.queue.shift()!;
      try {
        resolve(await fn());
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }
}

export const requestQueue = new RequestQueue();
