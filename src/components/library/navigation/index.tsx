import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Home, User, Settings, Bell } from 'lucide-react';

// Header Component
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

export const Header: React.FC<HeaderProps> = ({
  logo = 'Brand',
  navigation = [],
  actions = [],
  sticky = false,
  className = '',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`
        w-full z-50 transition-all duration-200
        ${sticky ? 'fixed top-0' : 'relative'}
        ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-sm'}
        ${className}
      `}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              aria-label="Go to homepage"
            >
              {logo}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex space-x-8"
            role="navigation"
            aria-label="Main navigation"
          >
            {navigation.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                aria-label={`Navigate to ${item.label}`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              const baseClasses = `
                inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
              `;
              
              const variantClasses = {
                primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
                secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
                ghost: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
              };

              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`${baseClasses} ${variantClasses[action.variant || 'ghost']}`}
                  aria-label={`${action.label} action`}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
              aria-label="Open mobile menu"
              aria-expanded="false"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - would be implemented with state management */}
    </header>
  );
};

// Navbar Component
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

export const Navbar: React.FC<NavbarProps> = ({
  brand,
  menu = [],
  actions = [],
  fixed = false,
  variant = 'light',
  className = '',
}) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const variantClasses = {
    light: 'bg-white border-gray-200 text-gray-900',
    dark: 'bg-gray-900 border-gray-700 text-white',
    transparent: 'bg-transparent border-transparent text-gray-900',
  };

  return (
    <nav
      className={`
        w-full border-b transition-all duration-300 z-40
        ${variantClasses[variant]}
        ${fixed ? 'fixed top-0 left-0 right-0' : 'relative'}
        ${className}
      `}
      role="navigation"
      aria-label="Primary navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          {brand && (
            <div className="flex items-center">
              <Link
                href={brand.href || '/'}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                aria-label="Navigate to homepage"
              >
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-8 h-8"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-xl font-bold">{brand.name}</span>
              </Link>
            </div>
          )}

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menu.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium transition-colors hover:text-blue-600"
                  aria-label={`Navigate to ${item.label}`}
                  aria-expanded={activeDropdown === index}
                  aria-haspopup={!!item.children}
                >
                  {item.label}
                </Link>

                {/* Dropdown Menu */}
                {item.children && activeDropdown === index && (
                  <div
                    className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    role="menu"
                    aria-label={`${item.label} submenu`}
                  >
                    <div className="py-2">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          href={child.href}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          role="menuitem"
                        >
                          <div className="font-medium">{child.label}</div>
                          {child.description && (
                            <div className="text-xs text-gray-500 mt-1">{child.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {actions.map((action, index) => {
              const baseClasses = `
                inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
                focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
              `;
              
              const variantClasses = {
                primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
                secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
                outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
              };

              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`${baseClasses} ${variantClasses[action.variant || 'outline']}`}
                >
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Sidebar Component
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

export const Sidebar: React.FC<SidebarProps> = ({
  brand,
  navigation = [],
  collapsed = false,
  onCollapse,
  className = '',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <aside
      className={`
        flex flex-col bg-gray-900 text-white h-full transition-all duration-300 z-30
        ${collapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {brand && (
          <Link
            href={brand.href || '/'}
            className={`flex items-center space-x-3 hover:opacity-80 transition-opacity ${
              collapsed ? 'justify-center' : ''
            }`}
            aria-label="Navigate to homepage"
          >
            {brand.logo && (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-8 h-8"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            {!collapsed && <span className="text-lg font-semibold">{brand.name}</span>}
          </Link>
        )}

        {onCollapse && (
          <button
            onClick={() => onCollapse(!collapsed)}
            className="p-1 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <X className={`w-4 h-4 transform transition-transform ${collapsed ? 'rotate-45' : 'rotate-180'}`} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item, index) => (
          <div key={index}>
            <Link
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg 
                hover:bg-gray-800 transition-colors group
                ${collapsed ? 'justify-center' : 'justify-between'}
              `}
              aria-label={`Navigate to ${item.label}`}
            >
              <div className="flex items-center space-x-3">
                {item.icon && (
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                )}
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>

              {item.children && !collapsed && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleExpanded(index);
                  }}
                  className="ml-auto p-1 hover:bg-gray-800 rounded"
                  aria-label={`Toggle ${item.label} submenu`}
                  aria-expanded={expandedItems.has(index)}
                >
                  <span className="transform transition-transform duration-200">
                    {expandedItems.has(index) ? '−' : '+'}
                  </span>
                </button>
              )}
            </Link>

            {/* Submenu */}
            {item.children && !collapsed && expandedItems.has(index) && (
              <div className="ml-8 mt-1 space-y-1" role="menu" aria-label={`${item.label} submenu`}>
                {item.children.map((child, childIndex) => (
                  <Link
                    key={childIndex}
                    href={child.href}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                    role="menuitem"
                  >
                    <span>{child.label}</span>
                    {child.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700">
                        {child.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

// Mobile Menu Component
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

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navigation = [],
  actions = [],
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-xl font-semibold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2" role="menu">
          {navigation.map((item, index) => (
            <div key={index}>
              <Link
                href={item.href}
                className="flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-blue-600 hover:bg-gray-50"
                onClick={!item.children ? onClose : undefined}
                role="menuitem"
              >
                <span>{item.label}</span>
                {item.children && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleExpanded(item.label);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label={`Toggle ${item.label} submenu`}
                    aria-expanded={expandedItems.has(item.label)}
                  >
                    <span className="text-sm">
                      {expandedItems.has(item.label) ? '−' : '+'}
                    </span>
                  </button>
                )}
              </Link>

              {/* Submenu */}
              {item.children && expandedItems.has(item.label) && (
                <div className="ml-4 mt-1 space-y-1" role="menu" aria-label={`${item.label} submenu`}>
                  {item.children.map((child, childIndex) => (
                    <Link
                      key={childIndex}
                      href={child.href}
                      className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:text-blue-600 hover:bg-gray-50"
                      onClick={onClose}
                      role="menuitem"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="p-4 border-t space-y-2">
          {actions.map((action, index) => {
            const baseClasses = `
              block w-full text-center px-4 py-2 text-sm font-medium rounded-md 
              focus:outline-none focus:ring-2 focus:ring-offset-2
            `;
            
            const variantClasses = {
              primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
              secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
            };

            return (
              <Link
                key={index}
                href={action.href}
                className={`${baseClasses} ${variantClasses[action.variant || 'primary']}`}
                onClick={onClose}
              >
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default {
  Header,
  Navbar,
  Sidebar,
  MobileMenu,
};