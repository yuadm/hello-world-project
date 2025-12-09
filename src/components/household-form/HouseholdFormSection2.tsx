import { useState, useMemo } from "react";
import { HouseholdFormData } from "@/pages/HouseholdForm";
import { RKInput, RKRadio, RKTextarea, RKButton, RKSectionTitle, RKInfoBox, RKPostcodeLookup } from "@/components/apply/rk";
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { 
  calculateAddressHistoryCoverage, 
  formatDateRange, 
  daysBetween 
} from "@/lib/addressHistoryCalculator";

interface Props {
  formData: HouseholdFormData;
  setFormData: React.Dispatch<React.SetStateAction<HouseholdFormData>>;
  validationErrors?: Record<string, string>;
}

export function HouseholdFormSection2({ formData, setFormData, validationErrors = {} }: Props) {
  const [showManualAddress, setShowManualAddress] = useState(!!formData.homeAddressLine1);
  const [previousAddressManual, setPreviousAddressManual] = useState<Record<number, boolean>>(() => {
    // Initialize with true for any address that already has data
    const initial: Record<number, boolean> = {};
    formData.addressHistory.forEach((addr, index) => {
      if (addr.line1 || addr.town || addr.postcode) {
        initial[index] = true;
      }
    });
    return initial;
  });

  // Create a serialized key of all dates to trigger recalculation when nested values change
  const addressHistoryDatesKey = useMemo(() => {
    return formData.addressHistory.map(entry => `${entry.moveIn || ''}-${entry.moveOut || ''}`).join('|');
  }, [formData.addressHistory]);

  // Calculate address history coverage
  const coverage = useMemo(() => {
    if (!formData.homeMoveIn) return null;
    
    // Convert addressHistory to format expected by calculator
    const historyForCalc = formData.addressHistory.map(addr => ({
      address: { 
        line1: addr.line1 || "", 
        line2: addr.line2 || "", 
        town: addr.town || "", 
        postcode: addr.postcode || "" 
      },
      moveIn: addr.moveIn || "",
      moveOut: addr.moveOut || ""
    }));
    
    return calculateAddressHistoryCoverage(
      { moveIn: formData.homeMoveIn },
      historyForCalc
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.homeMoveIn, formData.addressHistory, addressHistoryDatesKey]);

  const addAddressHistory = () => {
    setFormData(prev => ({
      ...prev,
      addressHistory: [...prev.addressHistory, { 
        line1: "", 
        line2: "", 
        town: "", 
        postcode: "", 
        moveIn: "", 
        moveOut: "" 
      }]
    }));
  };

  const removeAddressHistory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addressHistory: prev.addressHistory.filter((_, i) => i !== index)
    }));
    // Clean up manual state
    const newManual = { ...previousAddressManual };
    delete newManual[index];
    setPreviousAddressManual(newManual);
  };

  const updateAddressHistory = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      addressHistory: prev.addressHistory.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const handleCurrentAddressSelect = (address: { line1: string; line2: string; town: string; postcode: string }) => {
    setFormData(prev => ({
      ...prev,
      homeAddressLine1: address.line1,
      homeAddressLine2: address.line2,
      homeTown: address.town,
      homePostcode: address.postcode
    }));
    setShowManualAddress(true);
  };

  const handlePreviousAddressSelect = (index: number, address: { line1: string; line2: string; town: string; postcode: string }) => {
    setFormData(prev => ({
      ...prev,
      addressHistory: prev.addressHistory.map((addr, i) =>
        i === index ? { 
          ...addr, 
          line1: address.line1,
          line2: address.line2,
          town: address.town,
          postcode: address.postcode
        } : addr
      )
    }));
    setPreviousAddressManual(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div>
      <RKSectionTitle 
        title="2. Your Address History"
        description="You must provide a complete history of all addresses where you have lived for the past 5 years. This is a mandatory requirement for background checks."
      />

      <div className="space-y-8">
        {/* Current Home Address */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Current Home Address</h3>

          <RKPostcodeLookup
            label="Postcode"
            hint="Start typing your postcode to search for addresses"
            required
            value={formData.homePostcode}
            onChange={(postcode) => setFormData(prev => ({ ...prev, homePostcode: postcode }))}
            onAddressSelect={handleCurrentAddressSelect}
            error={validationErrors.homePostcode}
          />

          {showManualAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <RKInput
                  id="homeAddressLine1"
                  label="Address line 1"
                  required
                  value={formData.homeAddressLine1}
                  onChange={(e) => setFormData(prev => ({ ...prev, homeAddressLine1: e.target.value }))}
                  error={validationErrors.homeAddressLine1}
                />
              </div>
              <div className="md:col-span-2">
                <RKInput
                  id="homeAddressLine2"
                  label="Address line 2"
                  hint="Optional"
                  value={formData.homeAddressLine2}
                  onChange={(e) => setFormData(prev => ({ ...prev, homeAddressLine2: e.target.value }))}
                />
              </div>
              <RKInput
                id="homeTown"
                label="Town or city"
                required
                value={formData.homeTown}
                onChange={(e) => setFormData(prev => ({ ...prev, homeTown: e.target.value }))}
                error={validationErrors.homeTown}
              />
              <RKInput
                id="homePostcode"
                label="Postcode"
                required
                className="max-w-[200px]"
                value={formData.homePostcode}
                onChange={(e) => setFormData(prev => ({ ...prev, homePostcode: e.target.value }))}
                error={validationErrors.homePostcode}
              />
            </div>
          )}

          <RKInput
            id="homeMoveIn"
            label="When did you move into this address?"
            type="date"
            required
            className="max-w-[200px]"
            value={formData.homeMoveIn}
            onChange={(e) => setFormData(prev => ({ ...prev, homeMoveIn: e.target.value }))}
            error={validationErrors.homeMoveIn}
          />
        </div>

        {/* 5-Year Address History */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">5-Year Address History</h3>
          <p className="text-sm text-gray-600 -mt-2">
            Please add all previous addresses from the last 5 years. Your current address is already recorded above.
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
            {formData.addressHistory.map((addr, index) => (
              <div
                key={index}
                className="p-5 bg-white border border-gray-200 rounded-xl space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">Previous Address {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeAddressHistory(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>

                <RKPostcodeLookup
                  label="Postcode"
                  hint="Start typing the postcode to search"
                  required
                  value={addr.postcode || ""}
                  onChange={(postcode) => updateAddressHistory(index, "postcode", postcode)}
                  onAddressSelect={(address) => handlePreviousAddressSelect(index, address)}
                />

                {previousAddressManual[index] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <RKInput
                        id={`addressHistory_${index}_line1`}
                        label="Address line 1"
                        required
                        value={addr.line1 || ""}
                        onChange={(e) => updateAddressHistory(index, "line1", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <RKInput
                        id={`addressHistory_${index}_line2`}
                        label="Address line 2"
                        value={addr.line2 || ""}
                        onChange={(e) => updateAddressHistory(index, "line2", e.target.value)}
                      />
                    </div>
                    <RKInput
                      id={`addressHistory_${index}_town`}
                      label="Town or city"
                      required
                      value={addr.town || ""}
                      onChange={(e) => updateAddressHistory(index, "town", e.target.value)}
                    />
                    <RKInput
                      id={`addressHistory_${index}_postcode`}
                      label="Postcode"
                      required
                      className="max-w-[200px]"
                      value={addr.postcode || ""}
                      onChange={(e) => updateAddressHistory(index, "postcode", e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RKInput
                    id={`addressHistory_${index}_moveIn`}
                    label="Move-in date"
                    type="date"
                    required
                    value={addr.moveIn}
                    onChange={(e) => updateAddressHistory(index, "moveIn", e.target.value)}
                  />
                  <RKInput
                    id={`addressHistory_${index}_moveOut`}
                    label="Move-out date"
                    type="date"
                    required
                    value={addr.moveOut}
                    onChange={(e) => updateAddressHistory(index, "moveOut", e.target.value)}
                  />
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

          {(!coverage?.isCovered || coverage?.gaps.length > 0) && formData.addressHistory.length > 0 && (
            <RKTextarea
              id="addressGaps"
              label="Explain any gaps in your address history"
              hint="Please explain periods of travel, temporary accommodation, or other circumstances."
              rows={4}
              value={formData.addressGaps || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, addressGaps: e.target.value }))}
            />
          )}
        </div>

        {/* Overseas History */}
        <div className="space-y-4">
          <h3 className="rk-subsection-title">Overseas History</h3>

          <RKRadio
            name="livedOutsideUK"
            legend="Have you lived outside the UK in the last 5 years?"
            required
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" }
            ]}
            value={formData.livedOutsideUK}
            onChange={(value) => setFormData(prev => ({ ...prev, livedOutsideUK: value }))}
            error={validationErrors.livedOutsideUK}
          />

          {formData.livedOutsideUK === "Yes" && (
            <RKInfoBox type="info">
              <p className="mb-3">
                If you have lived outside the UK, you must obtain a police check or 'Certificate of Good Conduct' from the relevant countries. You will need to provide these documents to Ready Kids.
              </p>
              <RKTextarea
                id="outsideUKDetails"
                label="Please provide details"
                hint="Include which countries, dates, and confirmation that you will provide the required documentation."
                required
                rows={4}
                value={formData.outsideUKDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, outsideUKDetails: e.target.value }))}
              />
            </RKInfoBox>
          )}
        </div>
      </div>
    </div>
  );
}
