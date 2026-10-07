class SseService {
    clients = [];
    constructor() {
        // Periodic 30-second heartbeat to keep connections alive and prevent proxy timeouts
        setInterval(() => {
            this.sendHeartbeat();
        }, 30000);
    }
    addClient(userId, role, res, reviewCenterId, companyName) {
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
        const client = {
            userId,
            role: role?.toUpperCase(),
            reviewCenterId,
            companyName,
            res,
        };
        this.clients.push(client);
        // Clean up when client disconnects
        res.on("close", () => {
            this.removeClient(res);
        });
    }
    removeClient(res) {
        this.clients = this.clients.filter((c) => c.res !== res);
    }
    sendHeartbeat() {
        this.clients.forEach((client) => {
            try {
                client.res.write(": heartbeat\n\n");
            }
            catch (err) {
                this.removeClient(client.res);
            }
        });
    }
    broadcastNotification(notification) {
        if (!notification)
            return;
        const recipientId = notification.recipientId;
        const recipientRole = notification.recipientRole ? notification.recipientRole.toUpperCase() : "ALL";
        this.clients.forEach((client) => {
            const clientUserId = client.userId;
            const clientRole = client.role ? client.role.toUpperCase() : "";
            const isReviewCenterClient = clientRole === "REVIEW_CENTER_REPRESENTATIVE" ||
                clientRole === "REVIEWCENTER";
            // If client is review center, strictly forbid question bank events
            if (isReviewCenterClient) {
                if (notification.link && notification.link.includes("question-bank")) {
                    return;
                }
                if (notification.type === "QUESTION_APPROVED") {
                    return;
                }
                if (notification.title &&
                    notification.title.toLowerCase().includes("question bank")) {
                    return;
                }
            }
            let isTargeted = false;
            // 1. Direct notification to specific user or specific review center
            if (recipientId && clientUserId && recipientId === clientUserId) {
                isTargeted = true;
            }
            else if (recipientId &&
                client.reviewCenterId &&
                recipientId === client.reviewCenterId) {
                isTargeted = true;
            }
            // 2. Broadcast to ALL (ONLY for internal roles, NEVER for Review Center)
            else if (recipientRole === "ALL") {
                if (!isReviewCenterClient) {
                    isTargeted = true;
                }
            }
            // 3. Broadcast to review center role
            else if (isReviewCenterClient &&
                (recipientRole === "REVIEW_CENTER_REPRESENTATIVE" ||
                    recipientRole === "REVIEWCENTER")) {
                // Verify tenant scope if metadata provides specific review center info
                if (notification.metadata) {
                    try {
                        const meta = typeof notification.metadata === "string"
                            ? JSON.parse(notification.metadata)
                            : notification.metadata;
                        if (meta.reviewCenterId &&
                            client.reviewCenterId &&
                            meta.reviewCenterId !== client.reviewCenterId) {
                            return;
                        }
                        if (meta.companyName &&
                            client.companyName &&
                            meta.companyName.trim().toLowerCase() !==
                                client.companyName.trim().toLowerCase()) {
                            return;
                        }
                    }
                    catch {
                        // Ignore parse errors
                    }
                }
                isTargeted = true;
            }
            // 4. Broadcast to specific role (e.g. TEACHER, DEAN, SUPERADMIN)
            else if (!isReviewCenterClient && clientRole && recipientRole === clientRole) {
                isTargeted = true;
            }
            // 5. Broadcast to REVIEWER role (SUPERADMIN, DEAN, TEAMLEAD)
            else if (!isReviewCenterClient &&
                recipientRole === "REVIEWER" &&
                clientRole &&
                ["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(clientRole)) {
                isTargeted = true;
            }
            // 6. Broadcast to STAFF role (SUPERADMIN, DEAN, TEAMLEAD)
            else if (!isReviewCenterClient &&
                recipientRole === "STAFF" &&
                clientRole &&
                ["SUPERADMIN", "DEAN", "TEAMLEAD"].includes(clientRole)) {
                isTargeted = true;
            }
            if (isTargeted) {
                try {
                    client.res.write(`event: notification\n`);
                    client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
                }
                catch (err) {
                    this.removeClient(client.res);
                }
            }
        });
    }
    broadcastEvent(event, data) {
        if (!event)
            return;
        this.clients.forEach((client) => {
            try {
                client.res.write(`event: ${event}\n`);
                client.res.write(`data: ${JSON.stringify(data)}\n\n`);
            }
            catch (err) {
                this.removeClient(client.res);
            }
        });
    }
}
export const sseService = new SseService();
export default sseService;
