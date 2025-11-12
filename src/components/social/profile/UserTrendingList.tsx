import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingPost } from "@/hooks/useTrendingPosts";
import { Flame, Heart, MessageCircle, Eye, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useState } from "react";
import { PostDetailModal } from "../PostDetailModal";

interface UserTrendingListProps {
  trendingPosts: TrendingPost[];
  onToggleLike?: (postId: string) => void;
  onCommentCountChange?: (postId: string, increment: number) => void;
}

export const UserTrendingList = ({ 
  trendingPosts,
  onToggleLike,
  onCommentCountChange 
}: UserTrendingListProps) => {
  const [selectedPost, setSelectedPost] = useState<TrendingPost | null>(null);

  if (trendingPosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No tienes publicaciones en tendencia</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-destructive" />
            Tus Publicaciones en Tendencia ({trendingPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingPosts.map((post, idx) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="w-full p-4 border rounded-lg hover:bg-accent/50 transition-colors text-left"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`text-2xl font-bold ${idx < 3 ? "text-destructive" : "text-muted-foreground"}`}>
                      #{idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <UserAvatar
                        avatar={post.author.avatar}
                        name={post.author.name}
                        username={post.author.username}
                        size="sm"
                        showName={false}
                      />
                      <div>
                        <p className="font-semibold text-sm">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{post.author.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3 whitespace-pre-wrap line-clamp-3">{post.contenido}</p>
                    
                    {post.imagenes && post.imagenes.length > 0 && (
                      <img
                        src={post.imagenes[0]}
                        alt="Imagen del post"
                        className="rounded-lg w-full max-h-48 object-cover mb-3"
                      />
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="font-semibold">{post.trendingScore}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="text-xs text-muted-foreground">Me gusta</p>
                          <p className="font-semibold">{post.likes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Comentarios</p>
                          <p className="font-semibold">{post.comments}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-xs text-muted-foreground">Vistas</p>
                          <p className="font-semibold">{post.views}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Compartidos</p>
                          <p className="font-semibold">{post.shares}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPost && (
        <PostDetailModal
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          post={{
            id: selectedPost.id,
            author: selectedPost.author,
            content: selectedPost.contenido,
            image: selectedPost.imagenes?.[0],
            timestamp: new Date(selectedPost.created_at),
            likes: selectedPost.likes,
            comments: selectedPost.comments,
            views: selectedPost.views,
            shares: selectedPost.shares,
            isLiked: false,
          }}
          onToggleLike={onToggleLike}
          onCommentCountChange={onCommentCountChange}
        />
      )}
    </>
  );
};
