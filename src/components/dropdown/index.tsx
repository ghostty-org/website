import { useState, useRef, useEffect } from "react";

import { ChevronDown } from "lucide-react";
import classNames from "classnames";

import s from "./Dropdown.module.css";
import Link from "next/link";

type DropdownSize = "small" | "medium" | "large";
type DropdownTheme = "neutral" | "brand";

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

// Helper type to check if array of options has value property
type IsValueOption<T> = T extends DropdownOptionWithValue ? true : false;

type DropdownProps<T extends DropdownOption> = {
  options: T[];
  placeholder?: string;
  size?: DropdownSize;
  theme?: DropdownTheme;
  className?: string;
  width?: string;
} & (IsValueOption<T> extends true
  ? {
      value?: string;
      onChange: (value: string) => void;
    }
  : {
      value?: never;
      onChange?: never;
    });

function Dropdown<T extends DropdownOption>({
  options,
  value,
  onChange,
  placeholder = "Select option",
  size = "medium",
  theme = "brand",
  className,
  width,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Find selected option by either value or current path
  const selectedOption = options.find((opt) =>
    "value" in opt ? opt.value === value : false,
  );

  const handleSelect = (option: DropdownOption) => {
    if ("value" in option && option.value) {
      onChange?.(option.value);
    }

    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={classNames(s.dropdownContainer, className)}
      style={width ? { width } : undefined}
    >
      <button
        type="button"
        onClick={toggleOpen}
        className={classNames(s.trigger, {
          [s.small]: size === "small",
          [s.medium]: size === "medium",
          [s.large]: size === "large",
          [s.neutral]: theme === "neutral",
          [s.brand]: theme === "brand",
        })}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className={classNames(s.icon, { [s.open]: open })}
          size={size === "small" ? 14 : size === "medium" ? 16 : 18}
        />
      </button>
      {open && (
        <div className={s.menu}>
          {options.map((option) => {
            const optionClasses = classNames(s.option, {
              [s.selected]: "value" in option ? option.value === value : false,
              [s.small]: size === "small",
              [s.medium]: size === "medium",
              [s.large]: size === "large",
            });

            if ("href" in option && option.href) {
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

export default Dropdown;
