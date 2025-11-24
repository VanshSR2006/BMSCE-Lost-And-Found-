import { Calendar, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  type: "lost" | "found";
  imageUrl?: string;
}

const ItemCard = ({
  id,
  title,
  description,
  category,
  location,
  date,
  type,
  imageUrl,
}: ItemCardProps) => {
  return (
    <Link
      to={`/items/${id}`}
      className="block group"
    >
      <Card
        className="
          overflow-hidden rounded-xl border 
          transition-all duration-300 
          hover:shadow-2xl hover:-translate-y-2 
          hover:border-primary/30
          bg-card/60 backdrop-blur-sm
        "
      >
        {/* IMAGE */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="
              w-full h-full object-cover 
              transition-transform duration-500 ease-out 
              group-hover:scale-110
            "
          />

          {/* TYPE BADGE on image */}
          <div
            className="
              absolute top-3 right-3 
              bg-black/60 text-white px-3 py-1 text-xs rounded-full
              backdrop-blur-sm shadow
            "
          >
            {type === "lost" ? "🔴 Lost" : "🟢 Found"}
          </div>
        </div>

        {/* CONTENT */}
        <CardHeader>
          <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
            {title}
          </CardTitle>

          <CardDescription className="line-clamp-2 text-sm opacity-80">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">

            {/* LOCATION */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{location}</span>
            </div>

            {/* DATE */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{date}</span>
            </div>

            {/* CATEGORY */}
            <Badge
              variant="outline"
              className="
                mt-1 px-3 py-1 text-xs 
                rounded-full border-primary/40 text-primary
              "
            >
              {category}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ItemCard;
