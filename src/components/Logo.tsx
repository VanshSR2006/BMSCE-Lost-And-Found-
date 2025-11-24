const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-navy to-royal shadow-lg">
        <span className="text-primary-foreground font-serif font-bold text-xl tracking-wide">
          L<span className="font-sans">&</span>F
        </span>
      </div>
      <div className="hidden sm:flex flex-col">
        <span className="font-serif font-bold text-lg leading-none text-foreground">
          Lost <span className="font-sans">&</span> Found
        </span>
        <span className="text-xs text-muted-foreground">BMSCE Campus</span>
      </div>
    </div>
  );
};

export default Logo;
