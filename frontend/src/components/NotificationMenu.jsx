import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function NotificationMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  function fetchNotifications() {
    if (!user) return;
    api
      .unreadNotificationCount()
      .then((res) => setUnreadCount(res?.unread_count || 0))
      .catch(() => {});

    api
      .listNotifications()
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling setiap 15 detik

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  async function handleMarkAllRead() {
    try {
      await api.markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {}
  }

  async function handleNotificationClick(item) {
    if (!item.is_read) {
      try {
        await api.markNotificationAsRead(item.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)),
        );
      } catch (err) {}
    }
    setOpen(false);
  }

  if (!user) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus:outline-none"
        title="Notifikasi"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Notifikasi
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  {unreadCount} belum dibaca
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-blue-700 hover:underline"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                Belum ada notifikasi baru.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 transition cursor-pointer rounded-lg my-1 ${
                    !item.is_read
                      ? "bg-blue-50/70 hover:bg-blue-100/70"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <strong className="font-bold text-slate-900 leading-snug">
                      {item.title}
                    </strong>
                    {!item.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                    {item.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {new Date(item.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ·{" "}
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {item.campaign_id && (
                      <Link
                        to={
                          user.role === "admin"
                            ? "/admin"
                            : `/kampanye/${item.campaign_id}`
                        }
                        className="font-bold text-blue-700 hover:underline"
                      >
                        Lihat Detail →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
