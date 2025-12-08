import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKInput, RKRadio, RKButton, RKTextarea, RKSelect, RKSectionTitle, RKInfoBox } from "./rk";
import { useState, useMemo } from "react";
import { Plus, Trash2, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { 
  calculateAddressHistoryCoverage, 
  formatDateRange, 
  daysBetween 
} from "@/lib/addressHistoryCalculator";
import { 
  lookupAddressesByPostcode, 
  validatePostcode, 
  formatPostcode,
  type AddressListItem 
} from "@/lib/postcodeService";
import { toast } from "sonner";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section2AddressHistory = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [isLookingUpPostcode, setIsLookingUpPostcode] = useState(false);
  const [addressList, setAddressList] = useState<AddressListItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const addressHistory = watch("addressHistory") || [];
  const livedOutsideUK = watch("livedOutsideUK");
  const militaryBase = watch("militaryBase");
  const homeMoveIn = watch("homeMoveIn");
  const homePostcode = watch("homePostcode");

  // Calculate address history coverage
  const coverage = useMemo(() => {
    if (!homeMoveIn) return null;
    
    return calculateAddressHistoryCoverage(
      { moveIn: homeMoveIn },
      addressHistory
    );
  }, [homeMoveIn, addressHistory]);

  const addAddressHistory = () => {
    setValue("addressHistory", [
      ...addressHistory,
      {
        address: { line1: "", line2: "", town: "", postcode: "" },
        moveIn: "",
        moveOut: "",
      },
    ]);
  };

  const removeAddressHistory = (index: number) => {
    setValue("addressHistory", addressHistory.filter((_, i) => i !== index));
  };

  const handlePostcodeLookup = async () => {
    if (!homePostcode) {
      toast.error("Please enter a postcode first");
      return;
    }

    if (!validatePostcode(homePostcode)) {
      toast.error("Please enter a valid UK postcode");
      return;
    }

    setIsLookingUpPostcode(true);
    setAddressList([]);
    setSelectedAddress("");

    try {
      const addresses = await lookupAddressesByPostcode(homePostcode);
      
      if (addresses.length > 0) {
        setAddressList(addresses);
        setValue("homePostcode", formatPostcode(homePostcode));
        toast.success(`Found ${addresses.length} address${addresses.length > 1 ? 'es' : ''}. Please select yours.`);
      } else {
        toast.error("No addresses found for this postcode. Please enter manually.");
        setShowManualAddress(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to lookup addresses");
      setShowManualAddress(true);
    } finally {
      setIsLookingUpPostcode(false);
    }
  };

  const handleAddressSelect = (value: string) => {
    setSelectedAddress(value);
    
    if (value && value !== "") {
      const address = addressList[parseInt(value)];
      if (address) {
        setValue("homeAddress.line1", address.line1);
        setValue("homeAddress.line2", address.line2);
        setValue("homeAddress.town", address.town);
        setValue("homeAddress.postcode", formatPostcode(homePostcode));
        toast.success("Address selected and filled in!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <RKSectionTitle 
        title="Address History"
        description="We need your complete address history for the past 5 years for background checks."
      />

      {/* Current Home Address Subsection */}
      <div className="space-y-4">
        <h3 className="rk-subsection-title">Current Home Address</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <RKInput
              label="Postcode"
              required
              widthClass="10"
              placeholder="e.g. SW1A 1AA"
              {...register("homePostcode")}
            />
            <div className="mt-3 flex gap-3 flex-wrap">
              <RKButton
                type="button"
                variant="secondary"
                onClick={handlePostcodeLookup}
                disabled={isLookingUpPostcode || !homePostcode}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {isLookingUpPostcode ? "Looking up..." : "Find address"}
              </RKButton>
              <button
                type="button"
                onClick={() => {
                  setShowManualAddress(!showManualAddress);
                  setAddressList([]);
                  setSelectedAddress("");
                }}
                className="underline text-rk-primary hover:text-rk-primary-dark text-sm"
              >
                {showManualAddress ? "Use postcode lookup" : "Enter address manually"}
              </button>
            </div>
          </div>
        </div>

        {addressList.length > 0 && !showManualAddress && (
          <RKSelect
            label="Select your address"
            hint="Choose your address from the list"
            options={[
              { value: "", label: "Please select an address" },
              ...addressList.map((addr, index) => ({
                value: index.toString(),
                label: addr.formatted,
              })),
            ]}
            value={selectedAddress}
            onChange={(e) => handleAddressSelect(e.target.value)}
            required
          />
        )}

        {(showManualAddress || selectedAddress) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <RKInput
                label="Address line 1"
                required
                {...register("homeAddress.line1")}
              />
            </div>
            <div className="md:col-span-2">
              <RKInput label="Address line 2" {...register("homeAddress.line2")} />
            </div>
            <RKInput
              label="Town or city"
              required
              {...register("homeAddress.town")}
            />
            <RKInput
              label="Postcode"
              required
              widthClass="10"
              {...register("homeAddress.postcode")}
            />
          </div>
        )}

        <RKInput
          label="When did you move into this address?"
          type="date"
          required
          widthClass="10"
          {...register("homeMoveIn")}
        />
      </div>

      {/* 5-Year Address History Subsection */}
      <div className="space-y-4">
        <h3 className="rk-subsection-title">5-Year Address History</h3>
        <p className="text-sm text-gray-600 -mt-2">
          You must provide a complete history of all addresses where you have lived for the past 5 years.
        </p>

        {/* Timeline Status Card */}
        {coverage ? (
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            coverage.isCovered 
              ? 'bg-green-50 border-green-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className={`flex-shrink-0 ${coverage.isCovered ? 'text-green-600' : 'text-amber-600'}`}>
              {coverage.isCovered ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div>
              <span className={`font-semibold text-sm ${coverage.isCovered ? 'text-green-800' : 'text-amber-800'}`}>
                {coverage.isCovered ? 'Address history complete' : 'Incomplete address history'}
              </span>
              <p className={`text-sm mt-1 ${coverage.isCovered ? 'text-green-700' : 'text-amber-700'}`}>
                Coverage: {Math.round(coverage.coveragePercentage)}% ({coverage.totalDaysCovered} of {coverage.requiredDays} days)
              </p>
              {!coverage.isCovered && coverage.gaps.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-amber-800">Gaps detected:</p>
                  <ul className="text-sm text-amber-700 mt-1 space-y-0.5">
                    {coverage.gaps.map((gap, index) => (
                      <li key={index}>• {formatDateRange(gap.start, gap.end)} ({daysBetween(gap.start, gap.end)} days)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-gray-50 border-gray-200">
            <AlertTriangle className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <div>
              <span className="font-semibold text-sm text-gray-700">Address history status</span>
              <p className="text-sm text-gray-600 mt-1">Enter your current address move-in date to calculate coverage.</p>
            </div>
          </div>
        )}

        {/* Previous Addresses */}
        <div className="space-y-4">
          {addressHistory.map((_, index) => (
            <div
              key={index}
              className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">Previous Address {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeAddressHistory(index)}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <RKInput
                    label="Address line 1"
                    required
                    {...register(`addressHistory.${index}.address.line1`)}
                  />
                </div>
                <div className="md:col-span-2">
                  <RKInput label="Address line 2" {...register(`addressHistory.${index}.address.line2`)} />
                </div>
                <RKInput label="Town or city" required {...register(`addressHistory.${index}.address.town`)} />
                <RKInput label="Postcode" required widthClass="10" {...register(`addressHistory.${index}.address.postcode`)} />
                <RKInput label="Moved in" type="date" required {...register(`addressHistory.${index}.moveIn`)} />
                <RKInput label="Moved out" type="date" required {...register(`addressHistory.${index}.moveOut`)} />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addAddressHistory}
          disabled={coverage?.isCovered}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rk-primary border-2 border-dashed border-gray-300 rounded-lg hover:border-rk-primary hover:bg-rk-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          {coverage?.isCovered ? "Address history complete" : "Add previous address"}
        </button>

        {(!coverage?.isCovered || coverage?.gaps.length > 0) && (
          <RKTextarea
            label="Explain any gaps in your address history"
            hint="Please explain periods of travel, temporary accommodation, or other circumstances."
            rows={4}
            {...register("addressGaps")}
          />
        )}
      </div>

      {/* Overseas & Military History Subsection */}
      <div className="space-y-4">
        <h3 className="rk-subsection-title">Overseas & Military History</h3>

        <RKRadio
          legend="Have you lived outside the UK in the last 5 years?"
          required
          name="livedOutsideUK"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={livedOutsideUK || ""}
          onChange={(value) => setValue("livedOutsideUK", value as "Yes" | "No")}
        />

        {livedOutsideUK === "Yes" && (
          <RKInfoBox type="info">
            If you have lived outside the UK, you must obtain a police check or 'Certificate of
            Good Conduct' from the relevant countries.
          </RKInfoBox>
        )}

        <RKRadio
          legend="Have you lived or worked on a British military base abroad in the last 5 years?"
          required
          name="militaryBase"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={militaryBase || ""}
          onChange={(value) => setValue("militaryBase", value as "Yes" | "No")}
        />

        {militaryBase === "Yes" && (
          <RKInfoBox type="info">
            We will arrange Ministry of Defence (MoD) checks on your behalf. You may need to
            complete additional forms.
          </RKInfoBox>
        )}
      </div>
    </div>
  );
};
