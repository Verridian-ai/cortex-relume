import React, { useState, forwardRef } from 'react';
import { ChevronRight, Calendar, User, Tag, Clock, ExternalLink, Heart, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

// Card Component
export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Card = forwardRef<HTMLElement, CardProps>(({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const variantClasses = {
    default: 'bg-white shadow-sm',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border border-gray-200',
    ghost: 'bg-transparent',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const interactiveClasses = [
    clickable || onClick ? 'cursor-pointer' : '',
    hover ? 'hover:shadow-lg transition-shadow duration-200' : '',
    clickable || onClick ? 'hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200' : '',
  ].filter(Boolean).join(' ');

  const cardClasses = `
    rounded-lg overflow-hidden
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${interactiveClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const CardHeader = forwardRef<HTMLElement, CardHeaderProps>(({
  children,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const headerClasses = `
    border-b border-gray-100 pb-4 mb-4
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={headerClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

CardHeader.displayName = 'CardHeader';

// Card Content
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const CardContent = forwardRef<HTMLElement, CardContentProps>(({
  children,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const contentClasses = `
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={contentClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

CardContent.displayName = 'CardContent';

// Card Footer
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const CardFooter = forwardRef<HTMLElement, CardFooterProps>(({
  children,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const footerClasses = `
    border-t border-gray-100 pt-4 mt-4
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={footerClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

CardFooter.displayName = 'CardFooter';

// Article Card
export interface ArticleCardProps {
  title: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
    aspectRatio?: 'square' | 'video' | 'photo';
  };
  author?: {
    name: string;
    avatar?: string;
  };
  publishedAt?: string;
  readTime?: string;
  tags?: string[];
  href?: string;
  variant?: 'default' | 'featured' | 'minimal';
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  description,
  image,
  author,
  publishedAt,
  readTime,
  tags = [],
  href,
  variant = 'default',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
  };

  const cardVariantClasses = {
    default: 'shadow-sm hover:shadow-md',
    featured: 'shadow-lg hover:shadow-xl',
    minimal: 'shadow-none border border-gray-200',
  };

  const ContentWrapper = href ? 'a' : 'div';
  const contentProps = href ? { href, className: 'block hover:no-underline' } : {};

  return (
    <Card
      variant={variant === 'minimal' ? 'outlined' : 'default'}
      hover={true}
      className={`
        ${cardVariantClasses[variant]}
        ${className}
      `}
    >
      <ContentWrapper {...contentProps}>
        {image && (
          <div className={`${aspectRatioClasses[image.aspectRatio || 'photo']} overflow-hidden`}>
            {!imageError ? (
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Image not available</span>
              </div>
            )}
          </div>
        )}

        <CardContent className="p-6">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {href ? (
              <a href={href} className="hover:text-blue-600 transition-colors">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>

          {description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {description}
            </p>
          )}

          {(author || publishedAt || readTime) && (
            <div className="flex items-center text-xs text-gray-500 space-x-4">
              {author && (
                <div className="flex items-center">
                  {author.avatar && (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  )}
                  <span>{author.name}</span>
                </div>
              )}

              {publishedAt && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <time dateTime={publishedAt}>
                    {new Date(publishedAt).toLocaleDateString()}
                  </time>
                </div>
              )}

              {readTime && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{readTime}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </ContentWrapper>
    </Card>
  );
};

// Product Card
export interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  image?: {
    src: string;
    alt: string;
  };
  rating?: number;
  reviews?: number;
  badges?: string[];
  variant?: 'default' | 'compact' | 'detailed';
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  href?: string;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  badges = [],
  variant = 'default',
  onAddToCart,
  onAddToWishlist,
  href,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const isOnSale = originalPrice && originalPrice > price;
  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  const ContentWrapper = href ? 'a' : 'div';
  const contentProps = href ? { href, className: 'block hover:no-underline' } : {};

  return (
    <Card
      variant="default"
      hover={true}
      className={`group ${className}`}
    >
      <ContentWrapper {...contentProps}>
        <div className="relative">
          {image && (
            <div className="aspect-square overflow-hidden">
              {!imageError ? (
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image not available</span>
                </div>
              )}
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-500 text-white rounded"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Sale badge */}
          {isOnSale && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-500 text-white rounded">
                -{discountPercentage}%
              </span>
            </div>
          )}

          {/* Actions */}
          {(onAddToCart || onAddToWishlist) && (
            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onAddToWishlist && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToWishlist();
                  }}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              )}
              {onAddToCart && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToCart();
                  }}
                  className="p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
                  aria-label="Add to cart"
                >
                  <span className="text-sm">+</span>
                </button>
              )}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {name}
          </h3>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-gray-900">
                ${price.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice!.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {reviews && (
                <span className="text-sm text-gray-500">({reviews})</span>
              )}
            </div>
          )}
        </CardContent>
      </ContentWrapper>
    </Card>
  );
};

// List Component
export interface ListProps {
  children: React.ReactNode;
  variant?: 'bullet' | 'numbered' | 'unstyled' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'tight' | 'normal' | 'loose';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const List = forwardRef<HTMLElement, ListProps>(({
  children,
  variant = 'bullet',
  size = 'md',
  spacing = 'normal',
  className = '',
  as: Component = 'ul',
  ...props
}, ref) => {
  const variantClasses = {
    bullet: 'list-disc list-inside',
    numbered: 'list-decimal list-inside',
    unstyled: 'list-none',
    icon: 'list-none',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const spacingClasses = {
    none: 'space-y-0',
    tight: 'space-y-1',
    normal: 'space-y-2',
    loose: 'space-y-4',
  };

  const listClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${spacingClasses[spacing]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={listClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

List.displayName = 'List';

// List Item Component
export interface ListItemProps {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const ListItem = forwardRef<HTMLElement, ListItemProps>(({
  children,
  icon: Icon,
  href,
  active = false,
  disabled = false,
  className = '',
  as: Component = 'li',
  ...props
}, ref) => {
  const isLink = !!href;
  const Wrapper = isLink ? (href.startsWith('http') ? 'a' : Link) : Component;
  const wrapperProps = isLink ? { 
    href,
    className: `flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:text-blue-600'} ${active ? 'text-blue-600 font-medium' : 'text-gray-700'} transition-colors ${className}`
  } : { className };

  return (
    <Wrapper
      ref={ref}
      {...wrapperProps}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2 flex-shrink-0" />}
      {children}
    </Wrapper>
  );
});

ListItem.displayName = 'ListItem';

// Image Component
export interface ImageProps {
  src: string;
  alt: string;
  fallback?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fallback,
  placeholder = 'empty',
  blurDataURL,
  width,
  height,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const objectFitClasses = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const containerClasses = `
    relative overflow-hidden
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const imgClasses = `
    transition-opacity duration-300
    ${objectFitClasses[objectFit]}
    ${imageLoading ? 'opacity-0' : 'opacity-100'}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={containerClasses} style={fill ? { width: '100%', height: '100%' } : { width, height }}>
      {imageError && fallback ? (
        <img
          src={fallback}
          alt={alt}
          className={`${imgClasses} w-full h-full`}
        />
      ) : imageError ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Image not available</span>
        </div>
      ) : (
        <>
          {placeholder === 'blur' && blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
              aria-hidden="true"
            />
          )}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            loading={loading}
            className={imgClasses}
            style={{
              objectFit,
              objectPosition,
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      )}
    </div>
  );
};

// Avatar Component
export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'circle' | 'rounded' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  border?: boolean;
  className?: string;
  onClick?: () => void;
  onError?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  variant = 'circle',
  status,
  border = false,
  className = '',
  onClick,
  onError,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    full: 'w-full h-full text-2xl',
  };

  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  const statusClasses = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-400',
  };

  const statusSizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
    full: 'w-5 h-5',
  };

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFallbackText = () => {
    if (alt) return getInitials(alt);
    return fallback || '?';
  };

  const avatarClasses = `
    relative inline-flex items-center justify-center font-medium
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${border ? 'ring-2 ring-white' : ''}
    ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={avatarClasses} onClick={onClick}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
          {getFallbackText()}
        </div>
      )}

      {status && (
        <div
          className={`
            absolute bottom-0 right-0 rounded-full
            ${statusSizeClasses[size]}
            ${statusClasses[status]}
            ${border ? 'ring-2 ring-white' : ''}
          `}
        />
      )}
    </div>
  );
};

// Badge Component
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  const badgeClasses = `
    inline-flex items-center font-medium rounded-full
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${dot ? 'space-x-1' : ''}
    ${removable ? 'space-x-1' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <span className={badgeClasses}>
      {dot && (
        <div className={`w-1.5 h-1.5 rounded-full ${variantClasses[variant].replace('bg-', 'bg-').replace('-100', '-500')}`} />
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-60 focus:outline-none"
          aria-label="Remove badge"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

// Skeleton Component
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className = '',
  variant = 'rectangular',
  lines = 1,
}) => {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  };

  const skeletonClasses = `
    animate-pulse bg-gray-200
    ${variantClasses[variant]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${skeletonClasses} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={skeletonClasses}
      style={style}
    />
  );
};

export default {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  ArticleCard,
  ProductCard,
  List,
  ListItem,
  Image,
  Avatar,
  Badge,
  Skeleton,
};