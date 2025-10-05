import { useEffect, useState } from "react";
import { Users, Heart } from "lucide-react";

export const FamilyTree = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative w-full py-16 flex items-center justify-center overflow-hidden">
      {/* Minimalist background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--teal-primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main content */}
      <div className={`relative max-w-5xl mx-auto px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* Hero image placeholder with gradient overlay */}
        <div className="relative mb-12 rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
          <div className="aspect-[16/9] bg-gradient-to-br from-teal-light to-primary relative">
            {/* Photo placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 text-primary-foreground">
                <Users className="w-24 h-24 mx-auto opacity-50" />
                <p className="text-sm font-light tracking-wide">Family Memories</p>
              </div>
            </div>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          </div>
        </div>

        {/* Minimalist tree representation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: Heart, label: 'Grandparents', desc: 'Wisdom & Love' },
            { icon: Users, label: 'Parents', desc: 'Guidance & Care' },
            { icon: Heart, label: 'Children', desc: 'Joy & Future' },
          ].map((item, i) => (
            <div
              key={i}
              className="card-minimal p-6 text-center space-y-3 animate-fadeIn hover:shadow-lg transition-all"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
                <item.icon className="w-8 h-8" style={{ color: 'hsl(var(--teal-primary))' }} />
              </div>
              <h3 className="font-semibold text-lg">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Connection lines - minimalist */}
        <div className="mt-8 flex items-center justify-center space-x-4 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
          <Heart className="w-6 h-6 text-primary" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
        </div>
      </div>
    </div>
  );
};
