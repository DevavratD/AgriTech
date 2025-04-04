
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Filter, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ForumPost, { Post } from "@/components/forum/ForumPost";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock forum posts
const initialPosts: Post[] = [
  {
    id: 1,
    author: "Ramesh Kumar",
    avatar: "R",
    title: "Best practices for drip irrigation in cotton",
    content: "I've been using drip irrigation for my cotton fields, but I'm not seeing the water efficiency I expected. Any tips on optimizing the system?",
    date: "2 hours ago",
    likes: 24,
    comments: 8,
    category: "Irrigation",
    isLiked: false,
  },
  {
    id: 2,
    author: "Sunita Devi",
    avatar: "S",
    title: "Early signs of tomato leaf disease - help identify!",
    content: "I've noticed some unusual spots on my tomato leaves. Attached are photos - can anyone help identify if this is early blight or something else?",
    date: "5 hours ago",
    likes: 18,
    comments: 12,
    category: "Disease Control",
    hasImage: true,
    isLiked: true,
  },
  {
    id: 3,
    author: "Vijay Singh",
    avatar: "V",
    title: "Market prices for organic produce in eastern region",
    content: "Has anyone sold organic vegetables in the eastern markets recently? I'm trying to gauge what premium I should expect compared to conventional prices.",
    date: "1 day ago",
    likes: 36,
    comments: 15,
    category: "Market Prices",
    isLiked: false,
  },
];

const Forum = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filter, setFilter] = useState("all");
  const isMobile = useIsMobile();

  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Farmer Community</h1>
        
        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className="h-8 text-xs sm:text-sm">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Topics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("irrigation")}>
                Irrigation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("disease")}>
                Disease Control
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("market")}>
                Market Prices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("soil")}>
                Soil Management
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("tech")}>
                Technology
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size={isMobile ? "sm" : "default"} className="h-8 text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            New Post
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Input 
          placeholder="Search discussions..." 
          className="pl-8 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
        />
        <MessageSquare className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {posts.map((post) => (
          <ForumPost 
            key={post.id} 
            post={post} 
            onLike={toggleLike} 
          />
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button variant="outline" size={isMobile ? "sm" : "default"} className="text-xs sm:text-sm">Load More</Button>
      </div>
    </div>
  );
};

export default Forum;
