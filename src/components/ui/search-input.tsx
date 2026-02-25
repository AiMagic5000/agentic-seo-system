'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Debounce hook (internal)
// ---------------------------------------------------------------------------
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Fires with the debounced value after `debounceMs` milliseconds */
  onChange?: (value: string) => void
  /** Immediate change handler (fires on every keystroke) */
  onImmediateChange?: (value: string) => void
  /** Debounce delay in milliseconds (default 300) */
  debounceMs?: number
  /** Show a clear (X) button when input has a value */
  clearable?: boolean
  /** Controlled value */
  value?: string
  /** Default / initial uncontrolled value */
  defaultValue?: string
  /** Wrapper div class names */
  wrapperClassName?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      onChange,
      onImmediateChange,
      debounceMs = 300,
      clearable = true,
      placeholder = 'Search...',
      value: controlledValue,
      defaultValue = '',
      className,
      wrapperClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined

    const [internalValue, setInternalValue] = React.useState(
      isControlled ? controlledValue : defaultValue
    )

    const currentValue = isControlled ? controlledValue : internalValue
    const debouncedValue = useDebounce(currentValue, debounceMs)

    // Fire debounced onChange whenever the debounced value changes
    const onChangePrev = React.useRef<string>(currentValue)
    React.useEffect(() => {
      if (debouncedValue !== onChangePrev.current) {
        onChangePrev.current = debouncedValue
        onChange?.(debouncedValue)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedValue])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (!isControlled) setInternalValue(val)
      onImmediateChange?.(val)
    }

    const handleClear = () => {
      if (!isControlled) setInternalValue('')
      onImmediateChange?.('')
      onChange?.('')
    }

    return (
      <div
        className={cn('relative flex items-center', wrapperClassName)}
      >
        {/* Search icon */}
        <Search
          size={15}
          className="pointer-events-none absolute left-3 text-[#64748b]"
          aria-hidden="true"
        />

        <input
          ref={ref}
          type="search"
          role="searchbox"
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            // Layout
            'w-full pl-9 pr-9 py-2 text-sm',
            // Colors
            'bg-[#0d1520] text-[#f1f5f9] placeholder:text-[#64748b]',
            // Border
            'rounded-lg border border-[#1e293b]',
            'transition-colors duration-150',
            // Focus
            'focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50',
            // Hover
            'hover:border-[#334155]',
            // Disabled
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Remove native search input clear button
            '[&::-webkit-search-cancel-button]:appearance-none',
            className
          )}
          {...props}
        />

        {/* Clear button */}
        {clearable && currentValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={cn(
              'absolute right-2.5 flex h-5 w-5 items-center justify-center',
              'rounded text-[#64748b] transition-colors duration-100',
              'hover:bg-[#1e293b] hover:text-[#f1f5f9]',
              'focus:outline-none focus:ring-1 focus:ring-[#2563eb]'
            )}
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'

export { SearchInput }
