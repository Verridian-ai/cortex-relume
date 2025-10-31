import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Check, X, AlertCircle, Eye, EyeOff, Calendar } from 'lucide-react';

// Input Component
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

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  placeholder,
  type = 'text',
  value,
  defaultValue,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  helperText,
  size = 'md',
  variant = 'outline',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onChange,
  onFocus,
  onBlur,
  className = '',
  id,
  name,
  autoComplete,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => inputRef.current!);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const variantClasses = {
    outline: 'border border-gray-300 bg-white',
    filled: 'border-0 bg-gray-100',
    flushed: 'border-l-0 border-r-0 border-t-0 border-b border-gray-300 bg-transparent rounded-none px-0',
  };

  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500';
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';
  const focusedClasses = isFocused ? 'ring-2 ring-opacity-20' : 'ring-1 ring-opacity-0';

  const inputClasses = `
    w-full rounded-lg transition-all duration-200 outline-none
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${errorClasses}
    ${disabledClasses}
    ${focusedClasses}
    ${LeftIcon ? 'pl-10' : ''}
    ${RightIcon || type === 'password' ? 'pr-10' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1 ${
            required ? 'after:content-["*"] after:text-red-500 after:ml-0.5' : ''
          } ${error ? 'text-red-700' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        
        <input
          ref={inputRef}
          type={inputType}
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}

        {RightIcon && !rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}

        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          id={error ? `${inputId}-error` : `${inputId}-helper`}
          className={`mt-1 text-sm ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea Component
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

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  placeholder,
  value,
  defaultValue,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  helperText,
  resize = 'vertical',
  rows = 4,
  maxLength,
  onChange,
  onFocus,
  onBlur,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentLength, setCurrentLength] = useState(value?.length || 0);

  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  };

  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500';
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';
  const focusedClasses = isFocused ? 'ring-2 ring-opacity-20' : 'ring-1 ring-opacity-0';

  const textareaClasses = `
    w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg
    transition-all duration-200 outline-none
    ${errorClasses}
    ${disabledClasses}
    ${focusedClasses}
    ${resizeClasses[resize]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1 ${
            required ? 'after:content-["*"] after:text-red-500 after:ml-0.5' : ''
          } ${error ? 'text-red-700' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows}
        maxLength={maxLength}
        onChange={(e) => {
          setCurrentLength(e.target.value.length);
          onChange?.(e);
        }}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        className={textareaClasses}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        {...props}
      />

      {maxLength && (
        <div className="mt-1 flex justify-between">
          {(error || helperText) && (
            <p
              id={error ? `${inputId}-error` : `${inputId}-helper`}
              className={`text-sm ${
                error ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {error || helperText}
            </p>
          )}
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {currentLength}/{maxLength}
          </p>
        </div>
      )}

      {!maxLength && (error || helperText) && (
        <p
          id={error ? `${inputId}-error` : `${inputId}-helper`}
          className={`mt-1 text-sm ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select Component
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

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  placeholder,
  options,
  value,
  defaultValue,
  disabled = false,
  required = false,
  error,
  helperText,
  size = 'md',
  variant = 'outline',
  multiple = false,
  searchable = false,
  onChange,
  onFocus,
  onBlur,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const variantClasses = {
    outline: 'border border-gray-300 bg-white',
    filled: 'border-0 bg-gray-100',
    flushed: 'border-l-0 border-r-0 border-t-0 border-b border-gray-300 bg-transparent rounded-none px-0',
  };

  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500';
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';
  const focusedClasses = isFocused ? 'ring-2 ring-opacity-20' : 'ring-1 ring-opacity-0';

  const selectClasses = `
    w-full rounded-lg transition-all duration-200 outline-none appearance-none
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${errorClasses}
    ${disabledClasses}
    ${focusedClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const filteredOptions = searchable
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium mb-1 ${
            required ? 'after:content-["*"] after:text-red-500 after:ml-0.5' : ''
          } ${error ? 'text-red-700' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {searchable && (
          <input
            type="text"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
          />
        )}
        
        <select
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          multiple={multiple}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={selectClasses}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        >
          {placeholder && !multiple && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {filteredOptions.map((option, index) => (
            <option
              key={index}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {(error || helperText) && (
        <p
          id={error ? `${inputId}-error` : `${inputId}-helper`}
          className={`mt-1 text-sm ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Checkbox Component
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

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  disabled = false,
  required = false,
  checked,
  defaultChecked,
  indeterminate = false,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const checkboxId = id || name;

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={checkboxId}
          name={name}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          value={value}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`
            w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${indeterminate ? 'bg-blue-600 border-blue-600' : 'checked:bg-blue-600 checked:border-blue-600'}
          `.replace(/\s+/g, ' ').trim()}
          aria-describedby={
            description ? `${checkboxId}-description` : undefined
          }
          {...props}
        />
        
        {(checked || indeterminate) && (
          <div className="absolute w-4 h-4 flex items-center justify-center pointer-events-none">
            {indeterminate ? (
              <div className="w-2 h-0.5 bg-white rounded" />
            ) : (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>
        )}
      </div>

      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`text-sm font-medium ${
                disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
              }`}
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
          {description && (
            <p
              id={`${checkboxId}-description`}
              className={`text-sm ${
                disabled ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio Component
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

export const Radio: React.FC<RadioProps> = ({
  name,
  options,
  value,
  defaultValue,
  disabled = false,
  required = false,
  orientation = 'vertical',
  onChange,
  onFocus,
  onBlur,
  className = '',
}) => {
  const containerClasses = `
    ${orientation === 'vertical' ? 'space-y-3' : 'flex space-x-6'}
    ${className}
  `;

  return (
    <div className={containerClasses}>
      {options.map((option, index) => (
        <div key={index} className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id={`${name}-${index}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              defaultChecked={defaultValue === option.value}
              disabled={disabled || option.disabled}
              required={required}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              className={`
                w-4 h-4 border border-gray-300 focus:ring-2 focus:ring-blue-500
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                checked:bg-blue-600 checked:border-blue-600
              `.replace(/\s+/g, ' ').trim()}
              aria-describedby={
                option.description ? `${name}-${index}-description` : undefined
              }
            />
          </div>

          <div className="ml-3">
            <label
              htmlFor={`${name}-${index}`}
              className={`text-sm font-medium ${
                disabled || option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
              }`}
            >
              {option.label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {option.description && (
              <p
                id={`${name}-${index}-description`}
                className={`text-sm ${
                  disabled || option.disabled ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {option.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Switch Component
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

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({
  label,
  description,
  disabled = false,
  checked,
  defaultChecked,
  onChange,
  onFocus,
  onBlur,
  size = 'md',
  className = '',
  id,
  name,
}, ref) => {
  const [isChecked, setIsChecked] = useState(checked || defaultChecked || false);
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5',
    lg: 'w-12 h-6',
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const translateClasses = {
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-6',
  };

  const handleClick = () => {
    if (disabled) return;
    
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onChange?.(newChecked);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  const switchId = id || name;

  return (
    <div className={`flex items-start ${className}`}>
      <button
        ref={ref}
        id={switchId}
        name={name}
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        className={`
          relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer
          transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${sizeClasses[size]}
          ${isChecked ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        `.replace(/\s+/g, ' ').trim()}
        aria-describedby={
          description ? `${switchId}-description` : undefined
        }
      >
        <span className="sr-only">
          {isChecked ? 'On' : 'Off'}
        </span>
        
        <span
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow transform ring-0
            transition ease-in-out duration-200
            ${thumbSizeClasses[size]}
            ${isChecked ? translateClasses[size] : 'translate-x-0'}
          `.replace(/\s+/g, ' ').trim()}
        />
      </button>

      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={switchId}
              className={`text-sm font-medium ${
                disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={`${switchId}-description`}
              className={`text-sm ${
                disabled ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';

// Form Field Wrapper
export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  children,
  className = '',
  id,
}) => {
  const childId = id || (React.isValidElement(children) ? children.props.id : undefined);
  const fieldId = childId || `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className={`block text-sm font-medium mb-1 ${
            required ? 'after:content-["*"] after:text-red-500 after:ml-0.5' : ''
          } ${error ? 'text-red-700' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
      
      {React.isValidElement(children) && (
        <div id={`${fieldId}-field`}>
          {React.cloneElement(children as React.ReactElement<any>, {
            id: fieldId,
            'aria-invalid': !!error,
            'aria-describedby': error 
              ? `${fieldId}-error` 
              : helperText 
                ? `${fieldId}-helper` 
                : undefined,
          })}
        </div>
      )}

      {(error || helperText) && (
        <p
          id={error ? `${fieldId}-error` : `${fieldId}-helper`}
          className={`mt-1 text-sm ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default {
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Switch,
  FormField,
};