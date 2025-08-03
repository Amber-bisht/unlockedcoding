import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, loading, error } = useNotifications();

  if (!user) {
    return <div className="container mx-auto p-8">Please sign in to view notifications.</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-muted-foreground">No notifications.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n._id || Math.random()}
              className={`p-4 rounded border ${!n.read?.includes(user?._id) ? "bg-accent/30 border-primary" : "bg-background border-border"}`}
            >
              <div className="font-semibold text-lg">{n.title}</div>
              <div className="text-sm text-muted-foreground mb-1">{n.message}</div>
              <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
              {!n.read?.includes(user?._id) && <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-primary text-white rounded">Unread</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 