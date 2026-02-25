'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void
  onImmediateChange?: (value: string) => void
  debounceMs?: number
  clearable?: boolean
  value?: string
  defaultValue?: string
  wrapperClassName?: string
}

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
        <Search
          size={15}
          className="pointer-events-none absolute left-3 text-[#80868b]"
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
            'w-full pl-9 pr-9 py-2 text-sm',
            'bg-white text-[#202124] placeholder:text-[#80868b]',
            'rounded-lg border border-[#dadce0]',
            'transition-colors duration-150',
            'focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]/30',
            'hover:border-[#bdc1c6]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-search-cancel-button]:appearance-none',
            className
          )}
          {...props}
        />

        {clearable && currentValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={cn(
              'absolute right-2.5 flex h-5 w-5 items-center justify-center',
              'rounded text-[#80868b] transition-colors duration-100 cursor-pointer',
              'hover:bg-[#f1f3f4] hover:text-[#202124]',
              'focus:outline-none focus:ring-1 focus:ring-[#1a73e8]'
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
