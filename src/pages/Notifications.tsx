import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Package } from "lucide-react";

const Notifications = () => {
  const mockNotifications = [
    {
      id: "1",
      title: "Possible match found!",
      message: "Your lost iPhone 13 Pro might match a recently found item.",
      time: "2 hours ago",
      read: false,
      type: "match",
    },
    {
      id: "2",
      title: "Item claimed",
      message: "Your found wallet has been marked as claimed.",
      time: "1 day ago",
      read: false,
      type: "claim",
    },
    {
      id: "3",
      title: "New message",
      message: "Someone contacted you about your lost keys.",
      time: "2 days ago",
      read: true,
      type: "message",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">Notifications</h1>
              <p className="text-muted-foreground">Stay updated on your items</p>
            </div>
            <Button variant="outline" size="sm">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          </div>

          {mockNotifications.length > 0 ? (
            <div className="space-y-3">
              {mockNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer hover:shadow-card transition-all ${
                    !notification.read ? "border-royal/30 bg-royal/5" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-royal/10 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-royal" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="default" className="ml-2">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
