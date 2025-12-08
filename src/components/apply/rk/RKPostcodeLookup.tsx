import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { lookupAddressesByPostcode, validatePostcode, formatPostcode, type AddressListItem } from "@/lib/postcodeService";

export interface RKPostcodeLookupProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (postcode: string) => void;
  onAddressSelect?: (address: { line1: string; line2: string; town: string; postcode: string }) => void;
  className?: string;
}

export const RKPostcodeLookup = ({
  label,
  hint,
  error,
  required,
  value = "",
  onChange,
  onAddressSelect,
  className,
}: RKPostcodeLookupProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressListItem[]>([]);
  const [showManual, setShowManual] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lookupAddresses = useCallback(async (postcode: string) => {
    if (!validatePostcode(postcode)) {
      setAddresses([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await lookupAddressesByPostcode(postcode);
      setAddresses(results);
      if (results.length > 0) {
        setIsOpen(true);
      } else {
        setShowManual(true);
      }
    } catch (err) {
      console.error("Postcode lookup failed:", err);
      setAddresses([]);
      setShowManual(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    onChange?.(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the lookup - wait for user to stop typing
    if (newValue.length >= 5) {
      debounceRef.current = setTimeout(() => {
        lookupAddresses(newValue);
      }, 400);
    } else {
      setAddresses([]);
      setIsOpen(false);
    }
  };

  const handleAddressClick = (address: AddressListItem) => {
    const formattedPostcode = formatPostcode(inputValue);
    setInputValue(formattedPostcode);
    onChange?.(formattedPostcode);
    setIsOpen(false);
    
    onAddressSelect?.({
      line1: address.line1,
      line2: address.line2,
      town: address.town,
      postcode: formattedPostcode,
    });
  };

  const handleManualEntry = () => {
    setShowManual(true);
    setIsOpen(false);
    // Trigger callback with just the postcode so parent knows to show manual fields
    if (inputValue && validatePostcode(inputValue)) {
      const formattedPostcode = formatPostcode(inputValue);
      onChange?.(formattedPostcode);
      onAddressSelect?.({
        line1: "",
        line2: "",
        town: "",
        postcode: formattedPostcode,
      });
    }
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-sm font-medium text-rk-text">
        {label}
        {required && <span className="text-rk-error ml-1">*</span>}
      </label>
      {hint && (
        <span className="block text-sm text-rk-text-light">{hint}</span>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => addresses.length > 0 && setIsOpen(true)}
          placeholder="e.g. SW1A 1AA"
          className={cn(
            "w-full max-w-[200px] px-4 py-3 bg-white border-2 border-rk-gray-300 rounded-xl text-base text-rk-text placeholder:text-rk-text-light transition-all duration-200 pr-10 uppercase",
            "hover:border-rk-gray-400 focus:outline-none focus:border-rk-primary focus:shadow-[0_0_0_3px_hsl(163_50%_38%/0.15)]",
            error && "border-rk-error bg-red-50",
            className
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-rk-primary animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-rk-text-light" />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && addresses.length > 0 && (
          <ul className="absolute z-50 w-full min-w-[350px] mt-2 max-h-60 overflow-auto bg-white border-2 border-rk-gray-300 rounded-xl shadow-lg">
            {addresses.map((address, index) => (
              <li
                key={index}
                onClick={() => handleAddressClick(address)}
                className="px-4 py-3 cursor-pointer hover:bg-rk-primary/10 text-sm first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
              >
                {address.formatted}
              </li>
            ))}
            <li
              onClick={handleManualEntry}
              className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm text-rk-primary font-medium border-t border-gray-200"
            >
              Enter address manually
            </li>
          </ul>
        )}

        {/* No results message */}
        {isOpen && addresses.length === 0 && !isLoading && inputValue.length >= 5 && validatePostcode(inputValue) && (
          <div className="absolute z-50 w-full min-w-[300px] mt-2 bg-white border-2 border-rk-gray-300 rounded-xl shadow-lg">
            <p className="px-4 py-3 text-sm text-rk-text-light">No addresses found</p>
            <button
              type="button"
              onClick={handleManualEntry}
              className="w-full px-4 py-3 text-sm text-rk-primary font-medium text-left hover:bg-gray-50 border-t border-gray-200 rounded-b-xl"
            >
              Enter address manually
            </button>
          </div>
        )}
      </div>
      
      {!showManual && (
        <button
          type="button"
          onClick={handleManualEntry}
          className="text-sm text-rk-primary hover:underline mt-2"
        >
          Enter address manually
        </button>
      )}
      
      {error && (
        <p className="text-sm text-rk-error mt-1">{error}</p>
      )}
    </div>
  );
};

RKPostcodeLookup.displayName = "RKPostcodeLookup";
