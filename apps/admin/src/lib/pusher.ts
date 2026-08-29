import Pusher from "pusher-js";

let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (pusherInstance) return pusherInstance;

  const key = import.meta.env.VITE_PUSHER_KEY;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER || "ap1";

  if (!key || key.trim() === "") {
    return null;
  }

  pusherInstance = new Pusher(key, {
    cluster,
    forceTLS: true,
  });

  return pusherInstance;
}

export default getPusherClient;
