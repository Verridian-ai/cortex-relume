'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Flag, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Review {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  unhelpful_count: number;
  user_vote?: 'helpful' | 'unhelpful';
  created_at: string;
  updated_at?: string;
  version_used?: string;
  use_case?: string;
  framework?: string;
}

interface ComponentReviewsProps {
  componentId: string;
  limit?: number;
}

const mockReviews: Review[] = [
  {
    id: '1',
    user: {
      id: 'user-1',
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      verified: true,
    },
    rating: 5,
    title: 'Excellent form builder with great documentation',
    content: 'This component saved me hours of development time. The documentation is comprehensive and the examples are very helpful. I especially love the built-in validation features.',
    helpful_count: 24,
    unhelpful_count: 2,
    created_at: '2024-01-10T10:30:00Z',
    version_used: '2.0.1',
    use_case: 'Enterprise dashboard',
    framework: 'React',
  },
  {
    id: '2',
    user: {
      id: 'user-2',
      name: 'Marcus Rodriguez',
      avatar: '/avatars/marcus.jpg',
    },
    rating: 4,
    title: 'Great component, minor styling limitations',
    content: 'The functionality is solid and it works well for our use case. My only concern is that the default styling requires some customization to match our design system. Otherwise, very satisfied.',
    helpful_count: 18,
    unhelpful_count: 1,
    created_at: '2024-01-08T14:22:00Z',
    version_used: '2.1.0',
    use_case: 'E-commerce platform',
    framework: 'Vue',
  },
  {
    id: '3',
    user: {
      id: 'user-3',
      name: 'Alex Thompson',
      avatar: '/avatars/alex.jpg',
    },
    rating: 5,
    title: 'Perfect for our accessibility requirements',
    content: 'We needed WCAG AA compliance and this component delivers. The keyboard navigation is smooth and the screen reader support is excellent. Highly recommend for accessibility-focused projects.',
    helpful_count: 31,
    unhelpful_count: 0,
    created_at: '2024-01-05T09:15:00Z',
    version_used: '2.0.3',
    use_case: 'Government portal',
    framework: 'Angular',
  },
  {
    id: '4',
    user: {
      id: 'user-4',
      name: 'Emma Wilson',
      avatar: '/avatars/emma.jpg',
    },
    rating: 3,
    title: 'Good functionality, needs better TypeScript support',
    content: 'The component works as expected but the TypeScript definitions could be improved. Some props are missing type annotations and the generics are not well documented.',
    helpful_count: 12,
    unhelpful_count: 3,
    created_at: '2024-01-03T16:45:00Z',
    version_used: '2.0.2',
    use_case: 'Internal tools',
    framework: 'React',
  },
];

export function ComponentReviews({ componentId, limit }: ComponentReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    use_case: '',
    framework: 'react',
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let sortedReviews = [...mockReviews];
      
      switch (sortBy) {
        case 'newest':
          sortedReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'oldest':
          sortedReviews.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'rating_high':
          sortedReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating_low':
          sortedReviews.sort((a, b) => a.rating - b.rating);
          break;
        case 'helpful':
          sortedReviews.sort((a, b) => (b.helpful_count - b.unhelpful_count) - (a.helpful_count - a.unhelpful_count));
          break;
      }

      if (limit) {
        sortedReviews = sortedReviews.slice(0, limit);
      }

      setReviews(sortedReviews);
      setLoading(false);
    }, 300);
  }, [componentId, sortBy, limit]);

  const handleReviewVote = (reviewId: string, voteType: 'helpful' | 'unhelpful') => {
    setReviews(prevReviews => 
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const newReview = { ...review };
          if (review.user_vote === voteType) {
            // Remove vote
            if (voteType === 'helpful') {
              newReview.helpful_count -= 1;
            } else {
              newReview.unhelpful_count -= 1;
            }
            newReview.user_vote = undefined;
          } else {
            // Add/change vote
            if (review.user_vote) {
              // Remove previous vote
              if (review.user_vote === 'helpful') {
                newReview.helpful_count -= 1;
              } else {
                newReview.unhelpful_count -= 1;
              }
            }
            // Add new vote
            if (voteType === 'helpful') {
              newReview.helpful_count += 1;
            } else {
              newReview.unhelpful_count += 1;
            }
            newReview.user_vote = voteType;
          }
          return newReview;
        }
        return review;
      })
    );
  };

  const handleSubmitReview = () => {
    // In a real app, this would submit to an API
    console.log('Submitting review:', newReview);
    setShowReviewForm(false);
    setNewReview({
      rating: 5,
      title: '',
      content: '',
      use_case: '',
      framework: 'react',
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-9 w-32 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Reviews</h2>
          <p className="text-muted-foreground">
            {reviews.length} reviews from the community
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="rating_high">Highest rating</SelectItem>
              <SelectItem value="rating_low">Lowest rating</SelectItem>
              <SelectItem value="helpful">Most helpful</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowReviewForm(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Write Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Form */}
          {showReviewForm && (
            <Card>
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>
                  Share your experience with this component
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: i + 1 }))}
                        className={`p-1 ${i < newReview.rating ? 'text-yellow-400' : 'text-muted-foreground'}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({newReview.rating}/5)</span>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief summary of your experience"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Review</label>
                  <Textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your detailed experience..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Use Case</label>
                    <input
                      type="text"
                      value={newReview.use_case}
                      onChange={(e) => setNewReview(prev => ({ ...prev, use_case: e.target.value }))}
                      placeholder="e.g., E-commerce platform"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Framework</label>
                    <Select value={newReview.framework} onValueChange={(value) => setNewReview(prev => ({ ...prev, framework: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue</SelectItem>
                        <SelectItem value="angular">Angular</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Reviews */}
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.avatar} alt={review.user.name} />
                      <AvatarFallback>
                        {review.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{review.user.name}</h4>
                        {review.user.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }, (_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          {Array.from({ length: 5 - review.rating }, (_, i) => (
                            <Star key={i} className="w-3 h-3 text-muted-foreground" />
                          ))}
                        </div>
                        <span>•</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-base mt-3">{review.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{review.content}</p>
                
                {/* Review Metadata */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {review.version_used && (
                    <Badge variant="outline">v{review.version_used}</Badge>
                  )}
                  {review.framework && (
                    <Badge variant="outline" className="capitalize">{review.framework}</Badge>
                  )}
                  {review.use_case && (
                    <Badge variant="outline">{review.use_case}</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleReviewVote(review.id, 'helpful')}
                      className={`flex items-center gap-1 text-xs ${
                        review.user_vote === 'helpful' ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({review.helpful_count})</span>
                    </button>
                    <button
                      onClick={() => handleReviewVote(review.id, 'unhelpful')}
                      className={`flex items-center gap-1 text-xs ${
                        review.user_vote === 'unhelpful' ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>Not helpful ({review.unhelpful_count})</span>
                    </button>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    <Flag className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rating Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
              </div>

              <Separator />

              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{rating}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Helpful?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Share your experience to help other developers
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </Button>
              <Button className="w-full" variant="outline">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}