import { Response } from "express";

class ReviewCenterSseService {
  // Map of reviewCenterId -> Set of client HTTP Response streams
  private clients: Map<string, Set<Response>> = new Map();

  addClient(reviewCenterId: string, res: Response) {
    if (!reviewCenterId) return;
    if (!this.clients.has(reviewCenterId)) {
      this.clients.set(reviewCenterId, new Set());
    }
    this.clients.get(reviewCenterId)!.add(res);
  }

  removeClient(reviewCenterId: string, res: Response) {
    if (!reviewCenterId || !this.clients.has(reviewCenterId)) return;
    const centerClients = this.clients.get(reviewCenterId)!;
    centerClients.delete(res);
    if (centerClients.size === 0) {
      this.clients.delete(reviewCenterId);
    }
  }

  broadcastToReviewCenter(reviewCenterId: string, data: any) {
    if (!reviewCenterId || !this.clients.has(reviewCenterId)) return;
    const centerClients = this.clients.get(reviewCenterId)!;
    const payload = `data: ${JSON.stringify(data)}\n\n`;

    centerClients.forEach((client) => {
      try {
        client.write(payload);
      } catch (err) {
        console.warn("Error sending RC SSE payload to client:", err);
      }
    });
  }
}

export const rcSseService = new ReviewCenterSseService();
export default rcSseService;
