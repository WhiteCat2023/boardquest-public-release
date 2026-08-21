import { Response } from "express";

export interface SseClient {
  userId?: string;
  role?: string;
  res: Response;
}

class SseService {
  private clients: SseClient[] = [];

  constructor() {
    // Periodic 30-second heartbeat to keep connections alive and prevent proxy timeouts
    setInterval(() => {
      this.sendHeartbeat();
    }, 30000);
  }

  addClient(userId: string | undefined, role: string | undefined, res: Response) {
    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    // Send initial reconnection instructions (browser retries after 5 seconds if disconnected)
    res.write("retry: 5000\n\n");
    res.write(`data: ${JSON.stringify({ type: "CONNECTED", message: "SSE connected successfully" })}\n\n`);

    const client: SseClient = { userId, role: role?.toUpperCase(), res };
    this.clients.push(client);

    // Clean up when client disconnects
    res.on("close", () => {
      this.removeClient(res);
    });
  }

  removeClient(res: Response) {
    this.clients = this.clients.filter((c) => c.res !== res);
  }

  private sendHeartbeat() {
    this.clients.forEach((client) => {
      try {
        client.res.write(": heartbeat\n\n");
      } catch (err) {
        this.removeClient(client.res);
      }
    });
  }

  broadcastNotification(notification: any) {
    if (!notification) return;

    const recipientId = notification.recipientId;
    const recipientRole = notification.recipientRole ? notification.recipientRole.toUpperCase() : "ALL";

    this.clients.forEach((client) => {
      const clientUserId = client.userId;
      const clientRole = client.role;

      let isTargeted = false;

      // 1. Direct notification to specific user
      if (recipientId && clientUserId && recipientId === clientUserId) {
        isTargeted = true;
      }
      // 2. Broadcast to ALL
      else if (recipientRole === "ALL") {
        isTargeted = true;
      }
      // 3. Broadcast to specific role (e.g. TEACHER, DEAN, SUPERADMIN)
      else if (clientRole && recipientRole === clientRole) {
        isTargeted = true;
      }
      // 4. Broadcast to REVIEWER role (SUPERADMIN, DEAN, TEAMLEAD)
      else if (
        recipientRole === "REVIEWER" &&
        clientRole &&
        ["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(clientRole)
      ) {
        isTargeted = true;
      }
      // 5. Broadcast to STAFF role (SUPERADMIN, DEAN, TEAMLEAD)
      else if (
        recipientRole === "STAFF" &&
        clientRole &&
        ["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(clientRole)
      ) {
        isTargeted = true;
      }

      if (isTargeted) {
        try {
          client.res.write(`event: notification\n`);
          client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
        } catch (err) {
          this.removeClient(client.res);
        }
      }
    });
  }
}

export const sseService = new SseService();
export default sseService;
