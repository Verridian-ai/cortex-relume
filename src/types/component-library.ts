// Component Library Type Definitions

// Navigation Component Types
export interface HeaderProps {
  logo?: string;
  navigation?: Array<{
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  sticky?: boolean;
  className?: string;
}

export interface NavbarProps {
  brand?: {
    logo?: string;
    name: string;
    href?: string;
  };
  menu?: Array<{
    label: string;
    href: string;
    children?: Array<{
      label: string;
      href: string;
      description?: string;
    }>;
  }>;
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'outline';
  }>;
  fixed?: boolean;
  variant?: 'light' | 'dark' | 'transparent';
  className?: string;
}

export interface SidebarProps {
  brand?: {
    logo?: string;
    name: string;
    href?: string;
  };
  navigation?: Array<{
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string;
    children?: Array<{
      label: string;
      href: string;
      badge?: string;
    }>;
  }>;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation?: Array<{
    label: string;
    href: string;
    children?: Array<{
      label: string;
      href: string;
    }>;
  }>;
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary';
  }>;
}

// Form Component Types
export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'flushed';
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
}

export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  rows?: number;
  maxLength?: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  className?: string;
  id?: string;
  name?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'flushed';
  multiple?: boolean;
  searchable?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  className?: string;
  id?: string;
  name?: string;
}

export interface CheckboxProps {
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
  name?: string;
}

export interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps {
  name: string;
  options: RadioOption[];
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface SwitchProps {
  label?: string;
  description?: string;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  name?: string;
}

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

// Layout Component Types
export interface ContainerProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fluid?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  '2xl'?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gapX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gapY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  autoFlow?: 'row' | 'column' | 'dense' | 'row-dense' | 'column-dense';
  autoCols?: 'auto' | 'min' | 'max' | 'fr';
  autoRows?: 'auto' | 'min' | 'max' | 'fr';
  template?: {
    columns?: string;
    rows?: string;
    areas?: string;
  };
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  items?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  content?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gapX?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gapY?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  grow?: boolean;
  shrink?: boolean;
  basis?: 'auto' | 'px' | '0' | 'full' | 'prose' | 'screen-sm' | 'screen-md' | 'screen-lg' | 'screen-xl' | 'screen-2xl';
  flex?: '1' | 'auto' | 'initial' | 'none';
  self?: 'auto' | 'start' | 'end' | 'center' | 'stretch';
  order?: 'first' | 'last' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export interface StackProps {
  children: React.ReactNode;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export interface CenterProps {
  children: React.ReactNode;
  inline?: boolean;
  minH?: 'screen' | 'screen-sm' | 'screen-md' | 'screen-lg' | 'screen-xl' | 'screen-2xl' | 'full';
  minW?: 'screen' | 'screen-sm' | 'screen-md' | 'screen-lg' | 'screen-xl' | 'screen-2xl' | 'full';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export interface AspectRatioProps {
  children: React.ReactNode;
  ratio?: 'square' | 'video' | 'photo' | 'auto' | number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export interface SafeAreaProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  all?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// Content Component Types
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

export interface ListProps {
  children: React.ReactNode;
  variant?: 'bullet' | 'numbered' | 'unstyled' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'tight' | 'normal' | 'loose';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export interface ListItemProps {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

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

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  lines?: number;
}

// Interactive Component Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export interface DropdownOption {
  value: string | number;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  triggerClassName?: string;
}

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  disabled?: boolean;
  className?: string;
  arrow?: boolean;
}

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  triggerType?: 'click' | 'hover' | 'focus';
  disabled?: boolean;
  className?: string;
  overlay?: boolean;
}

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  onChange?: (expandedIds: string[]) => void;
  variant?: 'default' | 'bordered' | 'ghost';
  className?: string;
}

// Preview System Types
export interface ComponentPreviewProps {
  component: React.ComponentType<any>;
  componentProps?: Record<string, any>;
  customizer?: any;
  showControls?: boolean;
  showCode?: boolean;
  showPreview?: boolean;
  defaultView?: 'mobile' | 'tablet' | 'desktop' | 'full';
  className?: string;
}

export interface ComponentGalleryProps {
  components: Array<{
    name: string;
    component: React.ComponentType<any>;
    props?: Record<string, any>;
    category?: string;
    description?: string;
  }>;
  categories?: string[];
  searchTerm?: string;
  onComponentSelect?: (component: React.ComponentType<any>, props?: Record<string, any>) => void;
  className?: string;
}