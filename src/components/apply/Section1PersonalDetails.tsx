import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKInput, RKSelect, RKRadio, RKButton, RKInfoBox, RKSectionTitle, RKRepeatingBlock } from "./rk";
import { Plus, AlertCircle } from "lucide-react";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section1PersonalDetails = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  const otherNames = watch("otherNames");
  const previousNames = watch("previousNames") || [];
  const rightToWork = watch("rightToWork");
  const dob = watch("dob");

  // Calculate age from DOB
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = dob ? calculateAge(dob) : 0;
  const isUnder18 = age > 0 && age < 18;

  const addPreviousName = () => {
    setValue("previousNames", [...previousNames, { fullName: "", dateFrom: "", dateTo: "" }]);
  };

  const removePreviousName = (index: number) => {
    setValue("previousNames", previousNames.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <RKSectionTitle 
        title="Personal Details"
        description="We need your personal information to verify your identity and process your registration."
      />

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RKSelect
          label="Title"
          required
          options={[
            { value: "", label: "Select title" },
            { value: "Mr", label: "Mr" },
            { value: "Mrs", label: "Mrs" },
            { value: "Miss", label: "Miss" },
            { value: "Ms", label: "Ms" },
            { value: "Mx", label: "Mx" },
            { value: "Dr", label: "Dr" },
            { value: "Other", label: "Other" },
          ]}
          {...register("title")}
        />

        <RKInput
          label="First name(s)"
          required
          {...register("firstName")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RKInput 
          label="Middle name(s)" 
          {...register("middleNames")} 
        />
        <RKInput 
          label="Last name" 
          required 
          {...register("lastName")} 
        />
      </div>

      {/* Gender */}
      <RKRadio
        legend="Gender"
        required
        name="gender"
        options={[
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ]}
        value={watch("gender") || ""}
        onChange={(value) => setValue("gender", value as "Male" | "Female")}
      />

      {/* Other Names */}
      <RKRadio
        legend="Have you been known by any other names?"
        hint="This includes your name at birth if different, maiden names, or names changed by deed poll."
        required
        name="otherNames"
        options={[
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ]}
        value={otherNames || ""}
        onChange={(value) => setValue("otherNames", value as "Yes" | "No")}
      />

      {otherNames === "Yes" && (
        <div className="space-y-4">
          {previousNames.map((_, index) => (
            <RKRepeatingBlock
              key={index}
              title={`Previous Name ${index + 1}`}
              onRemove={() => removePreviousName(index)}
            >
              <RKInput
                label="Full name"
                required
                {...register(`previousNames.${index}.fullName`)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RKInput
                  label="From date"
                  type="date"
                  required
                  {...register(`previousNames.${index}.dateFrom`)}
                />
                <RKInput
                  label="To date"
                  type="date"
                  required
                  {...register(`previousNames.${index}.dateTo`)}
                />
              </div>
            </RKRepeatingBlock>
          ))}
          <RKButton
            type="button"
            variant="secondary"
            onClick={addPreviousName}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add another name
          </RKButton>
        </div>
      )}

      {/* Date of Birth */}
      <RKInput
        label="Date of birth"
        hint="For example, 31 03 1980"
        type="date"
        required
        widthClass="10"
        {...register("dob")}
      />

      {isUnder18 && (
        <RKInfoBox type="error" title="Age requirement not met">
          You must be at least 18 years old to register as a childminder.
        </RKInfoBox>
      )}

      {/* Right to Work */}
      <RKSelect
        label="Do you have the right to work in the UK?"
        required
        options={[
          { value: "", label: "Select" },
          { value: "British Citizen", label: "Yes, I am a British Citizen" },
          { value: "Settled Status", label: "Yes, I have Settled/Pre-settled Status" },
          { value: "Visa", label: "Yes, I have a relevant Visa" },
          { value: "No", label: "No" },
        ]}
        {...register("rightToWork")}
      />

      {rightToWork === "No" && (
        <RKInfoBox type="info">
          We will need to verify your right to work status. If you do not have the right to work
          in the UK, we cannot proceed with your application.
        </RKInfoBox>
      )}

      {/* Contact Details Section */}
      <div className="rk-divider" />
      
      <RKSectionTitle 
        title="Contact Details"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RKInput
          label="Email address"
          type="email"
          placeholder="name@example.com"
          required
          {...register("email")}
        />
        <RKInput
          label="Mobile number"
          type="tel"
          placeholder="07123 456789"
          required
          {...register("phone")}
        />
      </div>

      <div className="rk-divider" />

      <RKInput
        label="National Insurance number"
        hint="It's on your National Insurance card, benefit letter, payslip or P60. For example, 'QQ 12 34 56 C'"
        placeholder="QQ 12 34 56 C"
        required
        widthClass="20"
        {...register("niNumber")}
      />
    </div>
  );
};
