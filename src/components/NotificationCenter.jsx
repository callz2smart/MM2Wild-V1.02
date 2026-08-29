import { useEffect, useState } from "react";

let notifications = [];
const listeners = new Set();
const timers = new Map();

function publish() {
  const snapshot = [...notifications];
  listeners.forEach((listener) => listener(snapshot));
}

export function dismissNotification(id) {
  window.clearTimeout(timers.get(id));
  notifications = notifications.map((notification) =>
    notification.id === id ? { ...notification, state: "closing" } : notification,
  );
  publish();

  window.clearTimeout(timers.get(`${id}:close`));
  timers.set(`${id}:close`, window.setTimeout(() => {
    notifications = notifications.filter((notification) => notification.id !== id);
    timers.delete(id);
    timers.delete(`${id}:close`);
    publish();
  }, 350));
}

export function showNotification({
  type = "success",
  title,
  message,
  role = type === "error" ? "alert" : "status",
  ariaLive = type === "error" ? "assertive" : "polite",
  duration = 4000,
}) {
  const id = `${Date.now()}-${crypto.randomUUID()}`;
  notifications = [...notifications, { id, state: "open", type, title, message, role, ariaLive }];
  publish();
  timers.set(id, window.setTimeout(() => dismissNotification(id), duration));
  return id;
}

function Notification({ notification }) {
  return (
    <div
      className={`max-w-[calc(100vw-32px)] ${notification.state === "closing" ? "copied-notification-leave" : "copied-notification-enter"}`}
      role="region"
      aria-label={`${notification.type} notification`}
    >
      <div className="relative bg-[#243157] rounded-[9px] overflow-hidden w-[310px] max-w-full" style={{ "--toast-color": `var(--color-${notification.type})` }}>
        <div className="w-1 absolute top-0 bottom-0 left-0 bg-(--toast-color)" />
        <div className="w-14 h-7 absolute bottom-0 left-0 blur-2xl bg-(--toast-color)" />
        <div className="flex gap-3 p-5 relative z-10">
          <div className="flex flex-col gap-0.5 flex-1">
            <p className="font-medium leading-none text-foreground">{notification.title}</p>
            <div role={notification.role} aria-live={notification.ariaLive} aria-atomic="true" className="text-sm font-medium leading-none text-accent">
              {notification.message}
            </div>
          </div>
          <button type="button" className="bg-[#18213A] hover:bg-[#18213A]/75 rounded-[7px] size-6 flex items-center justify-center transition-colors cursor-pointer absolute right-2 top-2" aria-label="Dismiss notification" onClick={() => dismissNotification(notification.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.75">
              <path fill="none" stroke="currentColor" d="M20 4 4 20M4 4l16 16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  const [visibleNotifications, setVisibleNotifications] = useState(() => [...notifications]);

  useEffect(() => {
    listeners.add(setVisibleNotifications);
    setVisibleNotifications([...notifications]);
    return () => listeners.delete(setVisibleNotifications);
  }, []);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed right-[calc(var(--layout-right,0px)+16px)] bottom-[calc(var(--layout-bottom,0px)+16px)] z-[10000] flex max-w-[calc(100vw-32px)] flex-col gap-3">
      {visibleNotifications.map((notification) => <Notification key={notification.id} notification={notification} />)}
    </div>
  );
}
