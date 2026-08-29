import Pusher from "pusher";

class PusherService {
  private client: Pusher | null = null;

  private getClient(): Pusher | null {
    if (this.client) return this.client;

    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.PUSHER_CLUSTER || "ap1";

    if (!appId || !key || !secret) {
      return null;
    }

    this.client = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });

    return this.client;
  }

  async broadcastNotification(notification: {
    id: string;
    title: string;
    message: string;
    type?: string;
    link?: string | null;
    recipientId?: string | null;
    recipientRole?: string | null;
    createdAt?: Date;
  }) {
    const client = this.getClient();
    const channels: string[] = [];

    if (notification.recipientId) {
      channels.push(`user-${notification.recipientId}`);
    } else if (notification.recipientRole) {
      const role = notification.recipientRole.toLowerCase();
      if (role === "all") {
        channels.push("role-all");
      } else {
        channels.push(`role-${role}`);
      }
    } else {
      channels.push("role-all");
    }

    const uniqueChannels = Array.from(new Set(channels));

    if (!client) {
      console.log(
        `[Pusher Simulation] Channels: [${uniqueChannels.join(", ")}], Notification: "${notification.title}"`
      );
      return;
    }

    try {
      await client.trigger(uniqueChannels, "notification", {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type || "INFO",
        link: notification.link,
        createdAt: notification.createdAt || new Date(),
      });
      console.log(`[Pusher] Broadcasted notification to channels: ${uniqueChannels.join(", ")}`);
    } catch (err: any) {
      console.error("[Pusher Error] Failed to trigger notification event:", err?.message || err);
    }
  }

  async broadcastEvent(channel: string | string[], eventName: string, data: any) {
    const client = this.getClient();
    const channels = Array.isArray(channel) ? channel : [channel];

    if (!client) {
      console.log(`[Pusher Simulation] Event: "${eventName}" on channel(s): [${channels.join(", ")}]`);
      return;
    }

    try {
      await client.trigger(channels, eventName, data);
      console.log(`[Pusher] Broadcasted event "${eventName}" to: ${channels.join(", ")}`);
    } catch (err: any) {
      console.error(`[Pusher Error] Failed to trigger "${eventName}":`, err?.message || err);
    }
  }
}

export const pusherService = new PusherService();
export default pusherService;
