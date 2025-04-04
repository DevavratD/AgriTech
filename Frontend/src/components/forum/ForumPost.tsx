
import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Post {
  id: number;
  author: string;
  avatar: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  category: string;
  hasImage?: boolean;
  isLiked: boolean;
}

interface ForumPostProps {
  post: Post;
  onLike: (postId: number) => void;
}

const ForumPost = ({ post, onLike }: ForumPostProps) => {
  return (
    <Card className="data-card overflow-hidden">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
              {post.avatar}
            </div>
            <div>
              <h3 className="font-medium text-base">{post.author}</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3 mr-1" />
                {post.date}
              </div>
            </div>
          </div>
          <Badge variant="outline">{post.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium text-lg mb-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
        
        {post.hasImage && (
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-3">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="h-8 w-8" />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 flex justify-between">
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "text-muted-foreground flex items-center gap-1 px-2",
              post.isLiked && "text-primary"
            )}
            onClick={() => onLike(post.id)}
          >
            <ThumbsUp className="h-4 w-4" />
            {post.likes}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground flex items-center gap-1 px-2"
          >
            <MessageCircle className="h-4 w-4" />
            {post.comments}
          </Button>
        </div>
        <Button variant="outline" size="sm">
          Reply
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ForumPost;
