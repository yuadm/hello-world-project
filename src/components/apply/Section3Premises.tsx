import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKInput, RKRadio, RKButton, RKTextarea, RKSectionTitle, RKInfoBox, RKPostcodeLookup } from "./rk";
import { RKAutocomplete } from "./rk/RKAutocomplete";
import { UK_LOCAL_AUTHORITIES } from "@/lib/ukLocalAuthorities";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { lookupPostcode } from "@/lib/postcodeService";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section3Premises = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const premisesType = watch("premisesType");
  const sameAddress = watch("sameAddress");
  const useAdditionalPremises = watch("useAdditionalPremises");
  const additionalPremises = watch("additionalPremises") || [];
  const pets = watch("pets");
  const childcarePostcode = watch("childcareAddress.postcode") || "";
  const homePostcode = watch("homePostcode");
  const localAuthority = watch("localAuthority");

  // Initialize visibility states based on existing data
  const [showChildcareAddressFields, setShowChildcareAddressFields] = useState(() => {
    const childcareAddress = form.getValues("childcareAddress");
    return !!(childcareAddress?.line1 || childcareAddress?.town);
  });

  const showChildcareAddress =
    (premisesType === "Domestic" && sameAddress === "No") || premisesType === "Non-domestic";

  // Auto-populate local authority from home address postcode when section loads
  useEffect(() => {
    const autoPopulateLocalAuthority = async () => {
      if (!localAuthority && homePostcode) {
        try {
          const result = await lookupPostcode(homePostcode);
          if (result?.admin_district) {
            // Check if the district matches any LA in our list
            const matchingLA = UK_LOCAL_AUTHORITIES.find(
              la => la.toLowerCase() === result.admin_district.toLowerCase()
            );
            if (matchingLA) {
              setValue("localAuthority", matchingLA);
            }
          }
        } catch (error) {
          console.error("Failed to auto-populate local authority:", error);
        }
      }
    };
    autoPopulateLocalAuthority();
  }, [homePostcode, localAuthority, setValue]);

  const addAdditionalPremises = () => {
    setValue("additionalPremises", [...additionalPremises, { address: "", reason: "" }]);
  };

  const removeAdditionalPremises = (index: number) => {
    setValue("additionalPremises", additionalPremises.filter((_, i) => i !== index));
  };

  const handleChildcareAddressSelect = (address: { line1: string; line2: string; town: string; postcode: string }) => {
    setValue("childcareAddress.line1", address.line1);
    setValue("childcareAddress.line2", address.line2);
    setValue("childcareAddress.town", address.town);
    setValue("childcareAddress.postcode", address.postcode);
    setShowChildcareAddressFields(true);
  };

  return (
    <div className="space-y-8">
      <RKSectionTitle 
        title="Your Childminding Premises"
        description="Tell us about where you will provide childcare services."
      />

      <h3 className="rk-subsection-title">Primary Childcare Premises</h3>

      <RKAutocomplete
        label="Local authority / council"
        hint="This is the local authority where the childcare premises is located. Start typing to search."
        required
        options={UK_LOCAL_AUTHORITIES}
        value={watch("localAuthority")}
        onChange={(value) => setValue("localAuthority", value)}
        placeholder="Start typing..."
      />

      <RKRadio
        legend="What type of premises will you primarily work from?"
        required
        name="premisesType"
        options={[
          { value: "Domestic", label: "Domestic (a home)" },
          { value: "Non-domestic", label: "Non-domestic (e.g., community hall, school site)" },
        ]}
        value={premisesType || "Domestic"}
        onChange={(value) => setValue("premisesType", value as "Domestic" | "Non-domestic")}
      />

      {premisesType === "Domestic" && (
        <RKRadio
          legend="Will this be your own home address?"
          required
          name="sameAddress"
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]}
          value={sameAddress || "Yes"}
          onChange={(value) => setValue("sameAddress", value as "Yes" | "No")}
        />
      )}

      {showChildcareAddress && (
        <div className="space-y-4 p-5 bg-rk-bg-form border border-rk-border rounded-xl">
          <RKInfoBox type="info">
            Please provide the full address of the premises. If it is a domestic address that is not
            your own home, we will need to conduct suitability checks on everyone living there aged
            16 or over.
          </RKInfoBox>
          
          <RKPostcodeLookup
            label="Postcode"
            hint="Start typing your postcode to search for addresses"
            required
            value={childcarePostcode}
            onChange={(postcode) => setValue("childcareAddress.postcode", postcode)}
            onAddressSelect={handleChildcareAddressSelect}
          />

          {showChildcareAddressFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <RKInput
                  label="Address line 1"
                  required
                  {...register("childcareAddress.line1")}
                />
              </div>
              <div className="md:col-span-2">
                <RKInput label="Address line 2" {...register("childcareAddress.line2")} />
              </div>
              <RKInput label="Town or city" required {...register("childcareAddress.town")} />
              <RKInput label="Postcode" required widthClass="10" {...register("childcareAddress.postcode")} />
            </div>
          )}
        </div>
      )}

      <RKRadio
        legend="Will you regularly use any additional premises for childminding?"
        hint="You do not need to tell us about routine outings (e.g., parks, libraries). This is for regular use of other settings."
        required
        name="useAdditionalPremises"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={useAdditionalPremises || ""}
        onChange={(value) => setValue("useAdditionalPremises", value as "Yes" | "No")}
      />

      {useAdditionalPremises === "Yes" && (
        <div className="space-y-4">
          {additionalPremises.map((_, index) => (
            <div
              key={index}
              className="p-5 bg-rk-bg-form border border-rk-border rounded-xl space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-rk-text">Additional Premises {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeAdditionalPremises(index)}
                  className="text-rk-error hover:text-rk-error/80 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              <RKTextarea
                label="Full address"
                required
                {...register(`additionalPremises.${index}.address`)}
                rows={3}
              />
              <RKTextarea
                label="Reason for using this premises"
                required
                {...register(`additionalPremises.${index}.reason`)}
                rows={2}
              />
            </div>
          ))}
          <RKButton
            type="button"
            variant="secondary"
            onClick={addAdditionalPremises}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add premises
          </RKButton>
        </div>
      )}

      <div className="rk-divider" />

      <h3 className="rk-subsection-title">Outdoor Space & Pets</h3>

      <RKRadio
        legend="Do you have an outdoor space available for children at your premises?"
        required
        name="outdoorSpace"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={watch("outdoorSpace") || ""}
        onChange={(value) => setValue("outdoorSpace", value as "Yes" | "No")}
      />

      <RKRadio
        legend="Do you have any pets at your premises?"
        required
        name="pets"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={pets || ""}
        onChange={(value) => setValue("pets", value as "Yes" | "No")}
      />

      {pets === "Yes" && (
        <RKTextarea
          label="Please provide details of your pets"
          hint="Include type of animal, breed, temperament, and how they will be managed during childcare hours."
          required
          rows={4}
          {...register("petsDetails")}
        />
      )}
    </div>
  );
};