import React, { forwardRef } from 'react';

// Container Component
export interface ContainerProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fluid?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Container = forwardRef<HTMLElement, ContainerProps>(({
  children,
  size = 'lg',
  center = true,
  padding = 'md',
  fluid = false,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-4 sm:px-6',
    lg: 'px-4 sm:px-6 lg:px-8',
    xl: 'px-4 sm:px-6 lg:px-8 xl:px-12',
  };

  const containerClasses = `
    ${fluid ? 'w-full' : `${sizeClasses[size]} mx-auto`}
    ${paddingClasses[padding]}
    ${center ? 'text-left' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={containerClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

Container.displayName = 'Container';

// Grid Component
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

export const Grid = forwardRef<HTMLElement, GridProps>(({
  children,
  cols,
  sm,
  md,
  lg,
  xl,
  '2xl': twoXL,
  gap,
  gapX,
  gapY,
  autoFlow,
  autoCols,
  autoRows,
  template,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
  };

  const responsiveColsClasses = [
    cols ? colsClasses[cols] : '',
    sm ? `sm:${colsClasses[sm]}` : '',
    md ? `md:${colsClasses[md]}` : '',
    lg ? `lg:${colsClasses[lg]}` : '',
    xl ? `xl:${colsClasses[xl!]}` : '',
    twoXL ? `2xl:${colsClasses[twoXL]}` : '',
  ].filter(Boolean).join(' ');

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
  };

  const gapXClasses = {
    none: 'gap-x-0',
    xs: 'gap-x-1',
    sm: 'gap-x-2',
    md: 'gap-x-4',
    lg: 'gap-x-6',
    xl: 'gap-x-8',
    '2xl': 'gap-x-12',
  };

  const gapYClasses = {
    none: 'gap-y-0',
    xs: 'gap-y-1',
    sm: 'gap-y-2',
    md: 'gap-y-4',
    lg: 'gap-y-6',
    xl: 'gap-y-8',
    '2xl': 'gap-y-12',
  };

  const gapClass = gap ? gapClasses[gap] : '';
  const gapXClass = gapX ? gapXClasses[gapX] : '';
  const gapYClass = gapY ? gapYClasses[gapY] : '';

  const autoFlowClasses = {
    row: 'grid-flow-row',
    column: 'grid-flow-col',
    dense: 'grid-flow-dense',
    'row-dense': 'grid-flow-row-dense',
    'column-dense': 'grid-flow-col-dense',
  };

  const autoColsClasses = {
    auto: 'auto-cols-auto',
    min: 'auto-cols-min',
    max: 'auto-cols-max',
    fr: 'auto-cols-fr',
  };

  const autoRowsClasses = {
    auto: 'auto-rows-auto',
    min: 'auto-rows-min',
    max: 'auto-rows-max',
    fr: 'auto-rows-fr',
  };

  const templateClasses = [
    template?.columns ? `grid-cols-[${template.columns}]` : '',
    template?.rows ? `grid-rows-[${template.rows}]` : '',
    template?.areas ? `grid-areas-[${template.areas}]` : '',
  ].filter(Boolean).join(' ');

  const gridClasses = `
    grid
    ${responsiveColsClasses}
    ${gapClass}
    ${gapXClass}
    ${gapYClass}
    ${autoFlow ? autoFlowClasses[autoFlow] : ''}
    ${autoCols ? autoColsClasses[autoCols] : ''}
    ${autoRows ? autoRowsClasses[autoRows] : ''}
    ${templateClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={gridClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

Grid.displayName = 'Grid';

// Flex Component
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

export const Flex = forwardRef<HTMLElement, FlexProps>(({
  children,
  direction,
  wrap,
  justify,
  items,
  content,
  gap,
  gapX,
  gapY,
  grow,
  shrink,
  basis,
  flex,
  self,
  order,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse',
  };

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const itemsClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const contentClasses = {
    start: 'content-start',
    end: 'content-end',
    center: 'content-center',
    between: 'content-between',
    around: 'content-around',
    evenly: 'content-evenly',
    stretch: 'content-stretch',
  };

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
  };

  const gapXClasses = {
    none: 'gap-x-0',
    xs: 'gap-x-1',
    sm: 'gap-x-2',
    md: 'gap-x-4',
    lg: 'gap-x-6',
    xl: 'gap-x-8',
    '2xl': 'gap-x-12',
  };

  const gapYClasses = {
    none: 'gap-y-0',
    xs: 'gap-y-1',
    sm: 'gap-y-2',
    md: 'gap-y-4',
    lg: 'gap-y-6',
    xl: 'gap-y-8',
    '2xl': 'gap-y-12',
  };

  const basisClasses = {
    auto: 'basis-auto',
    px: 'basis-px',
    '0': 'basis-0',
    full: 'basis-full',
    prose: 'basis-prose',
    'screen-sm': 'basis-screen-sm',
    'screen-md': 'basis-screen-md',
    'screen-lg': 'basis-screen-lg',
    'screen-xl': 'basis-screen-xl',
    'screen-2xl': 'basis-screen-2xl',
  };

  const flexClasses = {
    '1': 'flex-1',
    auto: 'flex-auto',
    initial: 'flex-initial',
    none: 'flex-none',
  };

  const selfClasses = {
    auto: 'self-auto',
    start: 'self-start',
    end: 'self-end',
    center: 'self-center',
    stretch: 'self-stretch',
  };

  const orderClasses = {
    first: 'order-first',
    last: 'order-last',
  };

  const flexClassesCombined = `
    flex
    ${direction ? directionClasses[direction] : ''}
    ${wrap ? wrapClasses[wrap] : ''}
    ${justify ? justifyClasses[justify] : ''}
    ${items ? itemsClasses[items] : ''}
    ${content ? contentClasses[content] : ''}
    ${gap ? gapClasses[gap] : ''}
    ${gapX ? gapXClasses[gapX] : ''}
    ${gapY ? gapYClasses[gapY] : ''}
    ${grow ? 'grow' : ''}
    ${shrink ? 'shrink' : ''}
    ${basis ? basisClasses[basis] : ''}
    ${flex ? flexClasses[flex] : ''}
    ${self ? selfClasses[self] : ''}
    ${order && typeof order === 'number' ? `order-${order}` : orderClasses[order as keyof typeof orderClasses] || ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={flexClassesCombined}
      {...props}
    >
      {children}
    </Component>
  );
});

Flex.displayName = 'Flex';

// Stack Component (Vertical spacing utility)
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

export const Stack = forwardRef<HTMLElement, StackProps>(({
  children,
  spacing = 'md',
  direction = 'vertical',
  align,
  justify,
  wrap = false,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const spacingClasses = {
    none: 'space-y-0',
    xs: direction === 'vertical' ? 'space-y-1' : 'space-x-1',
    sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    xl: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
    '2xl': direction === 'vertical' ? 'space-y-12' : 'space-x-12',
    '3xl': direction === 'vertical' ? 'space-y-16' : 'space-x-16',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
  };

  const stackClasses = `
    ${direction === 'horizontal' ? 'flex' : ''}
    ${spacingClasses[spacing]}
    ${align ? alignClasses[align] : ''}
    ${justify ? justifyClasses[justify] : ''}
    ${wrap ? 'flex-wrap' : 'flex-nowrap'}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={stackClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

Stack.displayName = 'Stack';

// Center Component
export interface CenterProps {
  children: React.ReactNode;
  inline?: boolean;
  minH?: 'screen' | 'screen-sm' | 'screen-md' | 'screen-lg' | 'screen-xl' | 'screen-2xl' | 'full';
  minW?: 'screen' | 'screen-sm' | 'screen-md' | 'screen-lg' | 'screen-xl' | 'screen-2xl' | 'full';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Center = forwardRef<HTMLElement, CenterProps>(({
  children,
  inline = false,
  minH,
  minW,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const minHClasses = {
    screen: 'min-h-screen',
    'screen-sm': 'min-h-screen',
    'screen-md': 'min-h-screen',
    'screen-lg': 'min-h-screen',
    'screen-xl': 'min-h-screen',
    'screen-2xl': 'min-h-screen',
    full: 'min-h-full',
  };

  const minWClasses = {
    screen: 'min-w-screen',
    'screen-sm': 'min-w-screen',
    'screen-md': 'min-w-screen',
    'screen-lg': 'min-w-screen',
    'screen-xl': 'min-w-screen',
    'screen-2xl': 'min-w-screen',
    full: 'min-w-full',
  };

  const centerClasses = `
    ${inline ? 'inline-flex' : 'flex'}
    items-center justify-center
    ${minH ? minHClasses[minH] : ''}
    ${minW ? minWClasses[minW] : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={centerClasses}
      {...props}
    >
      {children}
    </Component>
  );
});

Center.displayName = 'Center';

// Aspect Ratio Component
export interface AspectRatioProps {
  children: React.ReactNode;
  ratio?: 'square' | 'video' | 'photo' | 'auto' | number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const AspectRatio = forwardRef<HTMLElement, AspectRatioProps>(({
  children,
  ratio = 'auto',
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const ratioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    auto: 'aspect-auto',
  };

  const aspectClasses = typeof ratio === 'number' 
    ? `aspect-[${ratio}]` 
    : ratioClasses[ratio as keyof typeof ratioClasses];

  const aspectRatioClasses = `
    ${aspectClasses}
    relative overflow-hidden
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <Component
      ref={ref}
      className={aspectRatioClasses}
      {...props}
    >
      <div className="absolute inset-0 w-full h-full">
        {children}
      </div>
    </Component>
  );
});

AspectRatio.displayName = 'AspectRatio';

// Safe Area Component
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

export const SafeArea = forwardRef<HTMLElement, SafeAreaProps>(({
  children,
  top = false,
  bottom = false,
  left = false,
  right = false,
  all = false,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const safeAreaClasses = `
    ${all || top ? 'pt-safe' : ''}
    ${all || bottom ? 'pb-safe' : ''}
    ${all || left ? 'pl-safe' : ''}
    ${all || right ? 'pr-safe' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Fallback for environments that don't support CSS safe area variables
  const fallbackStyles = {
    '--safe-area-inset-top': top || all ? 'env(safe-area-inset-top)' : '0px',
    '--safe-area-inset-bottom': bottom || all ? 'env(safe-area-inset-bottom)' : '0px',
    '--safe-area-inset-left': left || all ? 'env(safe-area-inset-left)' : '0px',
    '--safe-area-inset-right': right || all ? 'env(safe-area-inset-right)' : '0px',
  } as React.CSSProperties;

  return (
    <Component
      ref={ref}
      className={safeAreaClasses}
      style={fallbackStyles}
      {...props}
    >
      {children}
    </Component>
  );
});

SafeArea.displayName = 'SafeArea';

export default {
  Container,
  Grid,
  Flex,
  Stack,
  Center,
  AspectRatio,
  SafeArea,
};