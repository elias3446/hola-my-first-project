import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrendingPosts } from "@/hooks/useTrendingPosts";
import { Flame, Heart, MessageCircle, Eye, Share2, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { PostDetailModal } from "../PostDetailModal";
import { TrendingPost } from "@/hooks/useTrendingPosts";

interface GlobalTrendingListProps {
  onToggleLike?: (postId: string) => void;
  onCommentCountChange?: (postId: string, increment: number) => void;
}

export const GlobalTrendingList = ({
  onToggleLike,
  onCommentCountChange
}: GlobalTrendingListProps) => {
  const { trendingPosts, loading } = useTrendingPosts(30, false);
  const [selectedPost, setSelectedPost] = useState<TrendingPost | null>(null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Todas las Publicaciones en Tendencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trendingPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Todas las Publicaciones en Tendencia
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No hay publicaciones en tendencia en este momento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Todas las Publicaciones en Tendencia ({trendingPosts.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Las publicaciones más populares de la plataforma
          </p>
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
                        enableModal={true}
                        showName={false}
                      />
                      <Link 
                        to={`/usuario/${post.author.username}`} 
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <p className="font-semibold text-sm">{post.author.name}</p>
                          <p className="text-xs text-muted-foreground">
                            @{post.author.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </Link>
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
