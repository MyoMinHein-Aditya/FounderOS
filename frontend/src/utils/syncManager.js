const OFFLINE_QUEUE_KEY = "founderos_offline_queue";

export const syncManager = {
  queueRequest(request) {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    queue.push(request);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  },

  async replayQueue(apiInstance) {
    if (!navigator.onLine) return;
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
    if (queue.length === 0) return;
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    for (const req of queue) {
      try {
        await apiInstance({
          method: req.method,
          url: req.url,
          data: req.data
        });
      } catch (err) {
        console.error("Replay request failed:", err);
      }
    }
  }
};
