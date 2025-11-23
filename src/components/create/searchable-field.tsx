"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReactNode, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";

interface SearchableFieldProps {
  id: string;
  label: string;
  placeholder: string;
  icon: ReactNode;
  options: { value: string; label: string }[];
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SearchableField({
  id,
  label,
  placeholder,
  icon,
  options,
  value,
  onValueChange,
  error,
  required = false,
  disabled = false,
}: SearchableFieldProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Update input value when value prop changes
  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else if (value) {
      // If value exists but option not found, keep the current input value
      // This prevents clearing when options list is temporarily empty or filtered
      // Only clear if value is explicitly empty
      if (!value) {
        setInputValue("");
      }
    } else {
      setInputValue("");
    }
  }, [value, selectedOption]);

  // Filter options based on input value
  // Show all options when input is empty, filtered options when typing
  const filteredOptions = inputValue.trim() === ""
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setOpen(true);

    // If input doesn't match any option, clear the selected value
    const matchingOption = options.find(
      (opt) => opt.label.toLowerCase() === newValue.toLowerCase()
    );
    if (!matchingOption && value) {
      onValueChange("");
    }
  };

  const handleSelectOption = (option: { value: string; label: string }) => {
    setInputValue(option.label);
    onValueChange(option.value);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay to allow option click to fire before closing
    setTimeout(() => {
      // Check if focus moved to an option
      if (!containerRef.current?.contains(document.activeElement)) {
        // If input doesn't match selected value, reset to selected value
        if (selectedOption && inputValue !== selectedOption.label) {
          setInputValue(selectedOption.label);
        } else if (!selectedOption && inputValue) {
          setInputValue("");
        }
        setOpen(false);
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredOptions.length === 1) {
      e.preventDefault();
      handleSelectOption(filteredOptions[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div>
      <div className="relative mb-1" ref={containerRef}>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none flex items-center">
          <div className="w-4 h-4 text-muted-foreground">
            {icon}
          </div>
        </div>
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className={cn(
              "pl-10 pr-10 w-full",
              value && !disabled && "pr-16",
              error && "border-destructive"
            )}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange("");
                  setInputValue("");
                }}
                className="p-1 hover:bg-muted rounded-sm transition-colors"
                aria-label="Clear selection"
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        {open && !disabled && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelectOption(option)}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                className={cn(
                  "flex items-center px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                  value === option.value && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        )}
        {open && !disabled && filteredOptions.length === 0 && inputValue.trim() && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options found.
            </div>
          </div>
        )}
        {open && !disabled && options.length === 0 && !inputValue.trim() && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options available
            </div>
          </div>
        )}
      </div>
      <Label htmlFor={id} className="text-xs text-muted-foreground pt-1 pl-4">
        {required && "*"}
        {label}
      </Label>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

