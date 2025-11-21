import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { GovUKInput } from "./GovUKInput";
import { GovUKRadio } from "./GovUKRadio";
import { GovUKButton } from "./GovUKButton";
import { GovUKTextarea } from "./GovUKTextarea";
import { useState, useMemo } from "react";
import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { 
  calculateAddressHistoryCoverage, 
  formatDateRange, 
  daysBetween 
} from "@/lib/addressHistoryCalculator";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section2AddressHistory = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const [showManualAddress, setShowManualAddress] = useState(true);
  const addressHistory = watch("addressHistory") || [];
  const livedOutsideUK = watch("livedOutsideUK");
  const militaryBase = watch("militaryBase");
  const homeMoveIn = watch("homeMoveIn");

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

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-foreground">2. Address History</h2>

      <h3 className="text-xl font-bold">Current Home Address</h3>
      <p className="text-base">This is the address where you currently live.</p>

      <div>
        <GovUKInput
          label="Postcode"
          required
          widthClass="10"
          placeholder="e.g. SW1A 1AA"
          {...register("homePostcode")}
        />
        <p className="mt-2 text-sm">
          <button
            type="button"
            onClick={() => setShowManualAddress(!showManualAddress)}
            className="underline text-primary hover:text-primary/80"
          >
            {showManualAddress ? "Hide address form" : "Enter address manually"}
          </button>
        </p>
      </div>

      {showManualAddress && (
        <div className="space-y-4">
          <GovUKInput
            label="Address line 1"
            required
            {...register("homeAddress.line1")}
          />
          <GovUKInput label="Address line 2" {...register("homeAddress.line2")} />
          <GovUKInput
            label="Town or city"
            required
            widthClass="20"
            {...register("homeAddress.town")}
          />
          <GovUKInput
            label="Postcode"
            required
            widthClass="10"
            {...register("homeAddress.postcode")}
          />
        </div>
      )}

      <GovUKInput
        label="When did you move into this address?"
        type="date"
        required
        widthClass="10"
        {...register("homeMoveIn")}
      />

      <div className="border-t pt-6">
        <h3 className="text-2xl font-bold mb-4">5-Year Address History</h3>
        <p className="text-base mb-6">
          You must provide a complete history of all addresses where you have lived for the past 5
          years. This is required for background checks. Your current address is already recorded
          above.
        </p>

        {/* Coverage Status Display */}
        {coverage && (
          <div className="mb-6 space-y-4">
            {coverage.isCovered ? (
              <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-green))] bg-[hsl(var(--govuk-inset-green-bg))] flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-[hsl(var(--govuk-green))] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[hsl(var(--govuk-green))] mb-1">
                    ✓ Your address history covers the last 5 years
                  </p>
                  <p className="text-sm">
                    Coverage: {Math.round(coverage.coveragePercentage)}% ({coverage.totalDaysCovered} of {coverage.requiredDays} days)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-red))] bg-[hsl(var(--govuk-inset-red-bg))] flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-[hsl(var(--govuk-red))] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[hsl(var(--govuk-red))] mb-1">
                      Incomplete address history
                    </p>
                    <p className="text-sm">
                      Coverage: {Math.round(coverage.coveragePercentage)}% ({coverage.totalDaysCovered} of {coverage.requiredDays} days)
                    </p>
                  </div>
                </div>

                {coverage.gaps.length > 0 && (
                  <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))]">
                    <p className="font-bold mb-2">Gaps detected in your address history:</p>
                    <ul className="space-y-1">
                      {coverage.gaps.map((gap, index) => (
                        <li key={index} className="text-sm">
                          • {formatDateRange(gap.start, gap.end)} ({daysBetween(gap.start, gap.end)} days)
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm mt-3">
                      Please add previous addresses to fill these gaps, or explain them in the "Explain any gaps" section below.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!homeMoveIn && (
          <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-grey-border))] bg-[hsl(var(--govuk-inset-grey))] mb-4">
            <p className="text-sm">
              Please enter your current address move-in date above to calculate address history coverage.
            </p>
          </div>
        )}

        {addressHistory.map((_, index) => (
          <div
            key={index}
            className="mb-6 p-6 bg-[hsl(var(--govuk-grey-background))] border-l-4 border-[hsl(var(--govuk-grey-border))] space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Previous Address {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeAddressHistory(index)}
                className="text-[hsl(var(--govuk-red))] hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
            <GovUKInput
              label="Address line 1"
              {...register(`addressHistory.${index}.address.line1`)}
            />
            <GovUKInput label="Address line 2" {...register(`addressHistory.${index}.address.line2`)} />
            <GovUKInput label="Town or city" {...register(`addressHistory.${index}.address.town`)} />
            <GovUKInput label="Postcode" widthClass="10" {...register(`addressHistory.${index}.address.postcode`)} />
            <div className="grid grid-cols-2 gap-4">
              <GovUKInput label="Moved in" type="date" {...register(`addressHistory.${index}.moveIn`)} />
              <GovUKInput label="Moved out" type="date" {...register(`addressHistory.${index}.moveOut`)} />
            </div>
          </div>
        ))}

        <GovUKButton
          type="button"
          variant="secondary"
          onClick={addAddressHistory}
          className="flex items-center gap-2"
          disabled={coverage?.isCovered}
        >
          <Plus className="h-4 w-4" />
          {coverage?.isCovered ? "Address history complete" : "Add previous address"}
        </GovUKButton>
      </div>

      <GovUKTextarea
        label="Explain any gaps in address history"
        hint="If there are gaps in your address history, please explain periods of travel, temporary accommodation, or other circumstances."
        rows={4}
        {...register("addressGaps")}
      />

      <div className="space-y-6">
        <GovUKRadio
          legend="Have you lived outside the UK in the last 5 years?"
          required
          name="livedOutsideUK"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={livedOutsideUK || "No"}
          onChange={(value) => setValue("livedOutsideUK", value as "Yes" | "No")}
        />

        {livedOutsideUK === "Yes" && (
          <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))]">
            <p className="text-sm">
              If you have lived outside the UK, you must obtain a police check or 'Certificate of
              Good Conduct' from the relevant countries. You will need to provide these documents to
              Ready Kids.
            </p>
          </div>
        )}

        <GovUKRadio
          legend="Have you lived or worked on a British military base abroad in the last 5 years?"
          required
          name="militaryBase"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={militaryBase || "No"}
          onChange={(value) => setValue("militaryBase", value as "Yes" | "No")}
        />

        {militaryBase === "Yes" && (
          <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))]">
            <p className="text-sm">
              We will arrange Ministry of Defence (MoD) checks on your behalf. You may need to
              complete additional forms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
