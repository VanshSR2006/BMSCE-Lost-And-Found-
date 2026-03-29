import { Bell, Check, X } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NotificationDropdown = () => {
  const { notifications, clearNotification } = useNotifications();

  return (
    <div className="relative">
      <Bell className="w-5 h-5 cursor-pointer" />

      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
          {notifications.length}
        </span>
      )}

      <div className="absolute right-0 mt-3 w-96 bg-background border rounded-lg shadow-xl z-50">
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No notifications 🎉
          </p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="p-4 border-b space-y-3">
              <p className="text-sm font-semibold">
                🔔 Item Match Found
              </p>

              <div className="text-xs space-y-1 text-muted-foreground">
                <p><b>Found Item:</b> {n.foundItem.title}</p>
                <p><b>Category:</b> {n.foundItem.category}</p>
                <p><b>Description:</b> {n.foundItem.description}</p>
                <p><b>Location:</b> {n.foundItem.location}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex gap-1"
                  onClick={() => {
                    clearNotification(n._id);
                    toast.success("✅ Admin will help you connect with the finder");
                  }}
                >
                  <Check size={16} /> It’s mine
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex gap-1"
                  onClick={() => clearNotification(n._id)}
                >
                  <X size={16} /> Not mine
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

