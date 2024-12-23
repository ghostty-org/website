import { forwardRef, LegacyRef, useState, useRef, useEffect } from 'react';

import { ChevronDown } from 'lucide-react';
import classNames from 'classnames';

import s from './Dropdown.module.css';
import Link from 'next/link';

type DropdownSize = 'small' | 'medium' | 'large';
type DropdownTheme = 'neutral' | 'brand';

interface DropdownOptionBase {
  label: string;
}

interface DropdownOptionWithValue extends DropdownOptionBase {
  value: string;
  href?: never;
}

interface DropdownOptionWithLink extends DropdownOptionBase {
  href: string;
  value?: never;
}

type DropdownOption = DropdownOptionWithValue | DropdownOptionWithLink;


interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: DropdownSize;
  theme?: DropdownTheme;
  className?: string;
  width?: string;
}

function Dropdown(
  {
    options,
    value,
    onChange,
    placeholder = 'Select option',
    size = 'medium',
    theme = 'brand',
    className,
    width,
  }: DropdownProps,
  ref?: LegacyRef<HTMLDivElement>
) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option: DropdownOption) => {
    if ('value' in option && option.value) {
      onChange?.(option.value);
    }

    setIsOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={(node) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        if (dropdownRef) dropdownRef.current = node;
      }}
      className={classNames(s.dropdownContainer, className)}
      style={width ? { width } : undefined}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(s.trigger, {
          [s.small]: size === 'small',
          [s.medium]: size === 'medium',
          [s.large]: size === 'large',
          [s.neutral]: theme === 'neutral',
          [s.brand]: theme === 'brand',
        })}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className={classNames(s.icon, { [s.open]: isOpen })}
          size={size === 'small' ? 14 : size === 'medium' ? 16 : 18}
        />
      </button>

{isOpen && (
        <div className={s.menu}>
          {options.map((option) => {
            const optionClasses = classNames(s.option, {
              [s.selected]: 'value' in option ? option.value === value : false,
              [s.small]: size === 'small',
              [s.medium]: size === 'medium',
              [s.large]: size === 'large',
            });

            if ('href' in option && option.href) {
              return (
                <Link
                  key={option.href}
                  href={option.href}
                  className={optionClasses}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </Link>
              );
            }

            return (
              <button
                key={option.value}
                type="button"
                className={optionClasses}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default forwardRef(Dropdown);
