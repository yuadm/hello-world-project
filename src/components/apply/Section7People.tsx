import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { GovUKInput } from "./GovUKInput";
import { GovUKRadio } from "./GovUKRadio";
import { GovUKSelect } from "./GovUKSelect";
import { GovUKButton } from "./GovUKButton";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section7People = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const adultsInHome = watch("adultsInHome");
  const adults = watch("adults") || [];
  const childrenInHome = watch("childrenInHome");
  const children = watch("children") || [];
  const premisesType = watch("premisesType");
  
  // Only show household member questions for domestic premises
  const showHouseholdQuestions = premisesType === "Domestic" || !premisesType;

  const addAdult = () => {
    setValue("adults", [...adults, { fullName: "", relationship: "", dob: "" }]);
  };

  const removeAdult = (index: number) => {
    setValue("adults", adults.filter((_, i) => i !== index));
  };

  const addChild = () => {
    setValue("children", [...children, { fullName: "", dob: "" }]);
  };

  const removeChild = (index: number) => {
    setValue("children", children.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-foreground">7. Household Members</h2>

      <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))]">
        <p className="text-sm">
          <strong>Important:</strong> All adults (16+) who live at your childminding premises will require DBS checks. Children under 16 do not require checks but must be declared.
        </p>
      </div>

      {/* Adults in Home - Only for domestic premises */}
      {showHouseholdQuestions && (
        <>
      <GovUKRadio
        legend="Do any other adults (aged 16+) live at your childminding premises?"
        hint="Include partners, adult children, relatives, lodgers, etc."
        required
        name="adultsInHome"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={adultsInHome}
        onChange={(value) => setValue("adultsInHome", value as "Yes" | "No")}
      />

      {adultsInHome === "Yes" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Adult Household Members</h3>
          {adults.map((_, index) => (
            <div
              key={index}
              className="p-6 bg-[hsl(var(--govuk-grey-background))] border-l-4 border-[hsl(var(--govuk-grey-border))] space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Adult {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeAdult(index)}
                  className="text-[hsl(var(--govuk-red))] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              <GovUKInput 
                label="Full name" 
                required
                {...register(`adults.${index}.fullName`)} 
              />
              <GovUKInput 
                label="Relationship to you"
                hint="e.g., Partner, Adult child, Parent, Lodger, etc."
                required
                {...register(`adults.${index}.relationship`)} 
              />
              <GovUKInput
                label="Date of birth"
                type="date"
                required
                widthClass="10"
                {...register(`adults.${index}.dob`)}
              />
            </div>
          ))}
          <GovUKButton
            type="button"
            variant="secondary"
            onClick={addAdult}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add adult
          </GovUKButton>
        </div>
      )}

      {/* Children in Home */}
      <GovUKRadio
        legend="Do any children (under 16) live at your childminding premises?"
        hint="Include your own children, stepchildren, fostered children, etc."
        required
        name="childrenInHome"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={childrenInHome}
        onChange={(value) => setValue("childrenInHome", value as "Yes" | "No")}
      />

      {childrenInHome === "Yes" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Children in Household</h3>
          {children.map((_, index) => (
            <div
              key={index}
              className="p-6 bg-[hsl(var(--govuk-grey-background))] border-l-4 border-[hsl(var(--govuk-grey-border))] space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Child {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeChild(index)}
                  className="text-[hsl(var(--govuk-red))] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              <GovUKInput 
                label="Full name"
                required
                {...register(`children.${index}.fullName`)} 
              />
              <GovUKInput
                label="Date of birth"
                type="date"
                required
                widthClass="10"
                {...register(`children.${index}.dob`)}
              />
            </div>
          ))}
          <GovUKButton
            type="button"
            variant="secondary"
            onClick={addChild}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add child
          </GovUKButton>
        </div>
      )}
        </>
      )}

      {!showHouseholdQuestions && (
        <div className="p-4 border-l-[10px] border-[hsl(var(--govuk-blue))] bg-[hsl(var(--govuk-inset-blue-bg))]">
          <p className="text-sm">
            <strong>Note:</strong> Household member questions are not required for non-domestic premises.
          </p>
        </div>
      )}
    </div>
  );
};
