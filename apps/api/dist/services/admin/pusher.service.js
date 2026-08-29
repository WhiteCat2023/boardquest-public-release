import Pusher from "pusher";
class PusherService {
    client = null;
    getClient() {
        if (this.client)
            return this.client;
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
    async broadcastNotification(notification) {
        const client = this.getClient();
        const channels = [];
        if (notification.recipientId) {
            channels.push(`user-${notification.recipientId}`);
        }
        else if (notification.recipientRole) {
            const role = notification.recipientRole.toLowerCase();
            if (role === "all") {
                channels.push("role-all");
            }
            else {
                channels.push(`role-${role}`);
            }
        }
        else {
            channels.push("role-all");
        }
        const uniqueChannels = Array.from(new Set(channels));
        if (!client) {
            console.log(`[Pusher Simulation] Channels: [${uniqueChannels.join(", ")}], Notification: "${notification.title}"`);
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
        }
        catch (err) {
            console.error("[Pusher Error] Failed to trigger notification event:", err?.message || err);
        }
    }
    async broadcastEvent(channel, eventName, data) {
        const client = this.getClient();
        const channels = Array.isArray(channel) ? channel : [channel];
        if (!client) {
            console.log(`[Pusher Simulation] Event: "${eventName}" on channel(s): [${channels.join(", ")}]`);
            return;
        }
        try {
            await client.trigger(channels, eventName, data);
            console.log(`[Pusher] Broadcasted event "${eventName}" to: ${channels.join(", ")}`);
        }
        catch (err) {
            console.error(`[Pusher Error] Failed to trigger "${eventName}":`, err?.message || err);
        }
    }
}
export const pusherService = new PusherService();
export default pusherService;
