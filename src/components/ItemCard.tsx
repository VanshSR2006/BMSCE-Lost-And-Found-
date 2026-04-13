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
  thumbnail?: string;
  status?: "active" | "returned";
}

const CATEGORY_ICONS: Record<string, string> = {
  wallet: "account_balance_wallet",
  "id-card": "badge",
  bottle: "water_drop",
  stationery: "edit",
  electronics: "devices",
  other: "inventory_2",
};

const ItemCard = ({
  id,
  title,
  description,
  category,
  location,
  date,
  type,
  imageUrl,
  thumbnail,
  status = "active",
}: ItemCardProps) => {
  const displayImage = thumbnail || imageUrl || null;
  return (
    <Link
      to={`/items/${id}`}
      className="block group h-full"
    >
      <div
        className="
          h-full overflow-hidden rounded-[2rem] border border-white/5 
          transition-all duration-500 
          hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:-translate-y-2 
          hover:border-white/20
          bg-[#240e3b]/80 backdrop-blur-xl relative
          flex flex-col
        "
      >
        {/* Decorative corner glow */}
        <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-50 transition-all duration-500 group-hover:scale-150 ${type === 'lost' ? 'bg-[#ff2e97]' : 'bg-[#4af8e3]'}`}></div>

        {/* IMAGE */}
        <div className="relative h-48 overflow-hidden bg-[#16052a] flex-shrink-0">
          {displayImage ? (
            <img
              src={displayImage}
              alt={title}
              className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
            />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${type === 'lost' ? 'bg-[#ff2e97]/5' : 'bg-[#4af8e3]/5'}`}>
              <span className={`material-symbols-outlined text-5xl opacity-30 ${type === 'lost' ? 'text-[#ff2e97]' : 'text-[#4af8e3]'}`}
                style={{fontVariationSettings: "'FILL' 1"}}>
                {CATEGORY_ICONS[category] || "inventory_2"}
              </span>
              <span className="text-white/20 text-xs uppercase tracking-widest font-bold">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#240e3b] via-transparent to-transparent opacity-80"></div>

          {/* TYPE BADGE on image */}
          <div
            className={`
              absolute top-4 right-4 
              px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full
              backdrop-blur-md border shadow-[0_4px_10px_rgba(0,0,0,0.3)]
              ${type === "lost" 
                ? "bg-[#ff2e97]/20 text-[#ff2e97] border-[#ff2e97]/30" 
                : "bg-[#4af8e3]/20 text-[#4af8e3] border-[#4af8e3]/30"}
            `}
          >
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${type === 'lost' ? 'bg-[#ff2e97]' : 'bg-[#4af8e3]'} animate-pulse`}></span>
              {type === "lost" ? "Lost" : "Found"}
            </span>
          </div>

          {/* RETURNED BADGE overlay */}
          {status === "returned" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
              <div className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-2xl transform -rotate-12 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                 <span className="text-green-400 font-black uppercase tracking-[0.3em] text-lg">Returned</span>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-6 flex-1 flex flex-col z-10">
          <h3 className="text-xl font-bold leading-tight group-hover:text-white text-purple-50 transition-colors mb-2 font-['Plus_Jakarta_Sans'] line-clamp-1">
            {title}
          </h3>

          <p className="line-clamp-2 text-sm text-purple-200/50 mb-6 flex-1">
            {description}
          </p>

          <div className="space-y-3 text-xs text-purple-300/70 font-medium">
            {/* LOCATION */}
            <div className="flex items-center gap-2.5">
              <div className="bg-white/5 p-1 rounded-md border border-white/5 group-hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[#b89fff] text-[16px] block">location_on</span>
              </div>
              <span className="truncate">{location}</span>
            </div>

            {/* DATE */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className="bg-white/5 p-1 rounded-md border border-white/5 group-hover:bg-white/10 transition-colors">
                 <span className="material-symbols-outlined text-[#4af8e3] text-[16px] block">calendar_month</span>
              </div>
              <span>{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center mt-auto">
              {/* CATEGORY */}
              <span
                className="
                  inline-block px-3 py-1 text-[10px] uppercase font-bold tracking-wider
                  rounded-full border border-white/10 bg-white/5 text-purple-200/80
                "
              >
                {category}
              </span>
              <span className="material-symbols-outlined text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
