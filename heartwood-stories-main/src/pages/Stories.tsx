import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Heart, Calendar, Download, Edit, Trash2, Volume2, Loader2, FileText } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface Story {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const Stories = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setSession(session);
        loadStories(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStories = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error: any) {
      toast.error("Failed to load stories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setEditTitle(story.title);
    setEditContent(story.content);
  };

  const handleSaveEdit = async () => {
    if (!editingStory) return;

    try {
      const { error } = await supabase
        .from('stories')
        .update({ title: editTitle, content: editContent })
        .eq('id', editingStory.id);

      if (error) throw error;

      setStories(stories.map(s => 
        s.id === editingStory.id 
          ? { ...s, title: editTitle, content: editContent }
          : s
      ));
      
      toast.success("Story updated successfully");
      setEditingStory(null);
    } catch (error) {
      toast.error("Failed to update story");
      console.error(error);
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      setStories(stories.filter(s => s.id !== storyId));
      toast.success("Story deleted successfully");
    } catch (error) {
      toast.error("Failed to delete story");
      console.error(error);
    }
  };

  const handleTextToSpeech = async (story: Story) => {
    try {
      if (playingAudio === story.id && audioElement) {
        audioElement.pause();
        setPlayingAudio(null);
        setAudioElement(null);
        return;
      }

      if (audioElement) {
        audioElement.pause();
      }

      setPlayingAudio(story.id);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: story.content, voice: 'alloy' }
      });

      if (error) throw error;

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      setAudioElement(audio);
      
      audio.onended = () => {
        setPlayingAudio(null);
        setAudioElement(null);
      };

      await audio.play();
      toast.success("Playing story audio");
    } catch (error) {
      toast.error("Failed to generate audio");
      console.error(error);
      setPlayingAudio(null);
    }
  };

  const handleDownload = async (story: Story, format: 'pdf' | 'docx') => {
    try {
      const { data, error } = await supabase.functions.invoke('export-pdf', {
        body: { title: story.title, content: story.content, format }
      });

      if (error) throw error;

      if (format === 'pdf' && data.html) {
        // Client-side PDF generation using print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
      } else {
        // Download DOCX
        const blob = new Blob([atob(data.content)], { type: data.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast.success(`Story exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export story");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-vintage flex items-center justify-center">
        <div className="animate-pulse text-xl font-serif">Loading your stories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-minimal">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <header className="text-center mb-8 animate-fadeIn">
            <h1 className="text-5xl font-sans font-bold mb-4 flex items-center justify-center gap-3">
              <BookOpen className="w-12 h-12" style={{ color: 'hsl(var(--teal-primary))' }} />
              Family Stories
            </h1>
            <p className="text-xl text-muted-foreground">
              A collection of precious memories preserved forever
            </p>
          </header>

          {stories.length === 0 ? (
            <Card className="card-minimal text-center py-16 animate-fadeIn">
              <CardContent>
                <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-sans font-semibold mb-2">No Stories Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start a conversation to create your first family story
                </p>
                <Button onClick={() => navigate('/chat')}>
                  Begin Sharing Memories
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {stories.map((story, i) => (
                <Card 
                  key={story.id} 
                  className="card-minimal animate-fadeIn"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-sans mb-2">
                          {story.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(story.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTextToSpeech(story)}
                        >
                          {playingAudio === story.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(story, 'pdf')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(story, 'docx')}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(story)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(story.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {story.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {stories.length > 0 && (
            <div className="text-center mt-8">
              <Button onClick={() => navigate('/chat')} size="lg">
                Create Another Story
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingStory} onOpenChange={() => setEditingStory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={15}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStory(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stories;
