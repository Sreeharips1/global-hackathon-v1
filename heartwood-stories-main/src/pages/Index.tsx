import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FamilyTree } from "@/components/FamilyTree";
import { Heart, BookOpen, MessageCircle, Sparkles } from "lucide-react";
import { Session } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-vintage">
        <div className="animate-pulse text-xl font-serif">Loading your memories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-minimal">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-6xl md:text-7xl font-sans font-bold mb-6 text-shadow-minimal">
            Memory Keeper
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
            Preserve your precious family stories forever through heartfelt conversations and beautiful narratives
          </p>
        </header>

        {/* Animated Family Tree */}
        <div className="mb-16">
          <FamilyTree />
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          {session ? (
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg"
                onClick={() => navigate('/chat')}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Sharing Memories
              </Button>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/stories')}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Family Stories
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Begin Your Journey
              </Button>
              <p className="text-sm text-muted-foreground">
                Create your free account to start preserving memories
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          {[
            {
              icon: MessageCircle,
              title: "Guided Conversations",
              description: "AI asks thoughtful questions to help you share your life stories naturally"
            },
            {
              icon: Heart,
              title: "Heartfelt Stories",
              description: "Transform your memories into beautiful, heartfelt narratives to cherish"
            },
            {
              icon: BookOpen,
              title: "Family Legacy",
              description: "Create a lasting legacy of stories for generations to treasure"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="card-minimal p-6 text-center rounded-xl animate-fadeIn"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <feature.icon className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--teal-primary))' }} />
              <h3 className="font-sans text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-muted-foreground text-sm">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 fill-current" style={{ color: 'hsl(var(--teal-primary))' }} /> for families everywhere
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
