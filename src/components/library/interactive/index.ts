import React, { useState, useEffect, useRef, createContext, useContext, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Info, Check, ExternalLink, MoreHorizontal, AlertTriangle, CheckCircle } from 'lucide-react';

// Modal Component
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

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className = '',
  overlayClassName = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black bg-opacity-50 backdrop-blur-sm
        ${overlayClassName}
      `}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-xl w-full
          transform transition-all duration-200 ease-out
          ${sizeClasses[size]}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-gray-600"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Dropdown Component
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

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  options,
  align = 'start',
  open: controlledOpen,
  onOpenChange,
  className = '',
  triggerClassName = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleToggle = () => {
    const newOpen = !isOpen;
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setInternalOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        className={triggerClassName}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={`
            absolute top-full mt-1 z-50 min-w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1
            transform transition-all duration-200 ease-out
            ${alignClasses[align]}
          `.replace(/\s+/g, ' ').trim()}
          role="menu"
          aria-orientation="vertical"
        >
          {options.map((option, index) => {
            const Icon = option.icon;
            const handleOptionClick = () => {
              if (!option.disabled) {
                option.onClick?.();
                if (!option.href) {
                  handleClose();
                }
              }
            };

            const OptionComponent = option.href ? 'a' : 'button';

            return (
              <OptionComponent
                key={index}
                href={option.href}
                onClick={option.href ? undefined : handleOptionClick}
                className={`
                  w-full text-left px-4 py-2 text-sm transition-colors
                  flex items-start gap-3
                  ${option.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `.replace(/\s+/g, ' ').trim()}
                role="menuitem"
                disabled={option.disabled}
              >
                {Icon && <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <div>{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>
              </OptionComponent>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Tooltip Component
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

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  delay = 0,
  disabled = false,
  className = '',
  arrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    if (delay > 0) {
      const id = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      setTimeoutId(id);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const toggleTooltip = () => {
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
  };

  const getTriggerProps = () => {
    const commonProps = {
      ref: triggerRef,
    };

    switch (trigger) {
      case 'hover':
        return {
          ...commonProps,
          onMouseEnter: showTooltip,
          onMouseLeave: hideTooltip,
        };
      case 'click':
        return {
          ...commonProps,
          onClick: toggleTooltip,
        };
      case 'focus':
        return {
          ...commonProps,
          onFocus: showTooltip,
          onBlur: hideTooltip,
        };
      case 'manual':
        return commonProps;
      default:
        return commonProps;
    }
  };

  return (
    <>
      <div {...getTriggerProps()}>
        {children}
      </div>

      {isVisible && !disabled && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            pointer-events-none
            ${positionClasses[position]}
            ${className}
          `.replace(/\s+/g, ' ').trim()}
          role="tooltip"
        >
          {content}
          {arrow && (
            <div
              className={`
                absolute w-0 h-0 border-4
                ${arrowClasses[position]}
              `.replace(/\s+/g, ' ').trim()}
            />
          )}
        </div>
      )}
    </>
  );
};

// Popover Component
export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  triggerType?: 'click' | 'hover' | 'focus';
  disabled?: boolean;
  className?: string;
  overlay?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  position = 'auto',
  triggerType = 'click',
  disabled = false,
  className = '',
  overlay = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const togglePopover = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getTriggerProps = () => {
    const commonProps = {
      ref: triggerRef,
    };

    switch (triggerType) {
      case 'hover':
        return {
          ...commonProps,
          onMouseEnter: () => setIsOpen(true),
          onMouseLeave: () => setIsOpen(false),
        };
      case 'focus':
        return {
          ...commonProps,
          onFocus: () => setIsOpen(true),
          onBlur: () => setIsOpen(false),
        };
      case 'click':
      default:
        return {
          ...commonProps,
          onClick: togglePopover,
        };
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    auto: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
  };

  const popoverContent = (
    <>
      {overlay && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        ref={contentRef}
        className={`
          absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200
          transform transition-all duration-200 ease-out
          ${positionClasses[actualPosition]}
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        role="dialog"
        aria-modal="true"
      >
        {content}
      </div>
    </>
  );

  return (
    <>
      <div {...getTriggerProps()}>
        {trigger}
      </div>
      {isOpen && createPortal(popoverContent, document.body)}
    </>
  );
};

// Toast/Notification Component
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

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  dismissible = true,
  onDismiss,
  action,
}) => {
  useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-400',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-400',
    },
  };

  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <div
      className={`
        max-w-sm w-full ${style.bg} ${style.border} border rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-full
      `.replace(/\s+/g, ' ').trim()}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {message && (
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          )}
          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(id)}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Toast Container
export interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, clearAll }}>
      {children}
      {toasts.length > 0 && (
        <div
          className="fixed top-0 right-0 z-50 p-6 space-y-4 pointer-events-none"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast {...toast} onDismiss={dismissToast} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Accordion Component
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

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  onChange,
  variant = 'default',
  className = '',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(defaultExpanded));

  const handleToggle = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    
    if (expandedItems.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      if (!allowMultiple) {
        newExpanded.clear();
      }
      newExpanded.add(itemId);
    }

    setExpandedItems(newExpanded);
    onChange?.(Array.from(newExpanded));
  };

  const variantClasses = {
    default: 'border border-gray-200 rounded-lg overflow-hidden',
    bordered: 'border-t border-gray-200',
    ghost: '',
  };

  const itemClasses = {
    default: 'border-b border-gray-200 last:border-b-0',
    bordered: 'border-b border-gray-200 last:border-b-0',
    ghost: '',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {items.map((item) => {
        const isExpanded = expandedItems.has(item.id);
        const ChevronIcon = item.icon || ChevronDown;

        return (
          <div
            key={item.id}
            className={`
              ${itemClasses[variant]}
              ${variant === 'default' ? 'bg-white' : ''}
            `.replace(/\s+/g, ' ').trim()}
          >
            <button
              onClick={() => handleToggle(item.id)}
              disabled={item.disabled}
              className={`
                w-full px-4 py-3 text-left transition-colors
                ${item.disabled 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-900 hover:bg-gray-50'
                }
                flex items-center justify-between
              `.replace(/\s+/g, ' ').trim()}
              aria-expanded={isExpanded}
              aria-controls={`accordion-content-${item.id}`}
            >
              <span className="font-medium">{item.title}</span>
              <ChevronIcon
                className={`
                  w-5 h-5 transition-transform duration-200
                  ${isExpanded ? 'rotate-180' : ''}
                `.replace(/\s+/g, ' ').trim()}
              />
            </button>
            
            {isExpanded && (
              <div
                id={`accordion-content-${item.id}`}
                className="px-4 pb-3 text-gray-600"
                role="region"
                aria-labelledby={`accordion-button-${item.id}`}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default {
  Modal,
  Dropdown,
  Tooltip,
  Popover,
  Toast,
  ToastProvider,
  useToast,
  Accordion,
};