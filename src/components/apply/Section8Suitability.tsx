import { UseFormReturn, useFieldArray } from "react-hook-form";
import { ChildminderApplication, RegistrationEntry, OffenceEntry } from "@/types/childminder";
import { RKInput, RKRadio, RKTextarea, RKSectionTitle, RKInfoBox, RKButton } from "./rk";
import { Plus, X } from "lucide-react";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

const emptyRegistration: RegistrationEntry = {
  regulator: "",
  registrationNumber: "",
  startDate: "",
  endDate: "",
};

const emptyOffence: OffenceEntry = {
  date: "",
  details: "",
};

interface RegistrationBlockProps {
  form: UseFormReturn<Partial<ChildminderApplication>>;
  fieldName: "prevRegOfstedDetails" | "prevRegAgencyDetails" | "prevRegOtherUKDetails" | "prevRegEUDetails";
  addLabel: string;
}

const RegistrationBlock = ({ form, fieldName, addLabel }: RegistrationBlockProps) => {
  const { control, register, watch, setValue } = form;
  const entries = watch(fieldName) as RegistrationEntry[] || [{ ...emptyRegistration }];

  const addEntry = () => {
    setValue(fieldName, [...entries, { ...emptyRegistration }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setValue(fieldName, entries.filter((_, i) => i !== index));
    }
  };

  // Initialize with one empty entry if empty
  if (entries.length === 0) {
    setValue(fieldName, [{ ...emptyRegistration }]);
  }

  return (
    <div className="p-5 bg-rk-bg-form border border-rk-border rounded-xl space-y-6">
      {entries.map((entry, index) => (
        <div key={index} className="space-y-4">
          {entries.length > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#334155]">Registration {index + 1}</span>
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="text-sm text-[#DC2626] hover:text-[#B91C1C] flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Remove this registration
              </button>
            </div>
          )}
          {entries.length === 1 && (
            <span className="text-sm font-medium text-[#334155]">Registration 1</span>
          )}
          
          <RKInput
            label="Name of regulatory body/agency"
            required
            {...register(`${fieldName}.${index}.regulator` as const)}
          />
          
          <RKInput
            label="Registration reference number (URN)"
            required
            widthClass="20"
            {...register(`${fieldName}.${index}.registrationNumber` as const)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RKInput
              label="Start date"
              type="date"
              required
              {...register(`${fieldName}.${index}.startDate` as const)}
            />
            
            <RKInput
              label="End date"
              type="date"
              hint="Leave blank if still registered."
              {...register(`${fieldName}.${index}.endDate` as const)}
            />
          </div>

          {index < entries.length - 1 && <div className="rk-divider" />}
        </div>
      ))}
      
      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2 text-sm font-medium text-[hsl(163,50%,38%)] hover:text-[hsl(163,50%,30%)] transition-colors"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </button>
    </div>
  );
};

interface OffenceBlockProps {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

const OffenceBlock = ({ form }: OffenceBlockProps) => {
  const { register, watch, setValue } = form;
  const entries = watch("offenceDetails") as OffenceEntry[] || [{ ...emptyOffence }];

  const addEntry = () => {
    setValue("offenceDetails", [...entries, { ...emptyOffence }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setValue("offenceDetails", entries.filter((_, i) => i !== index));
    }
  };

  // Initialize with one empty entry if empty
  if (entries.length === 0) {
    setValue("offenceDetails", [{ ...emptyOffence }]);
  }

  return (
    <div className="p-5 bg-rk-bg-form border border-rk-border rounded-xl space-y-6">
      <h4 className="text-base font-semibold text-[#1E293B]">Details of Offences</h4>
      
      {entries.map((entry, index) => (
        <div key={index} className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#334155]">Offence {index + 1}</span>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="text-sm text-[#DC2626] hover:text-[#B91C1C] flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Remove this offence
              </button>
            )}
          </div>
          
          <RKInput
            label="Date of offence/caution"
            type="date"
            required
            {...register(`offenceDetails.${index}.date` as const)}
          />
          
          <RKTextarea
            label="Details of the offence and the outcome"
            required
            rows={4}
            {...register(`offenceDetails.${index}.details` as const)}
          />

          {index < entries.length - 1 && <div className="rk-divider" />}
        </div>
      ))}
      
      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2 text-sm font-medium text-[hsl(163,50%,38%)] hover:text-[hsl(163,50%,30%)] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add offence
      </button>
    </div>
  );
};

export const Section8Suitability = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  
  const prevRegOfsted = watch("prevRegOfsted");
  const prevRegAgency = watch("prevRegAgency");
  const prevRegOtherUK = watch("prevRegOtherUK");
  const prevRegEU = watch("prevRegEU");
  const healthCondition = watch("healthCondition");
  const smoker = watch("smoker");
  const disqualified = watch("disqualified");
  const socialServices = watch("socialServices");
  const otherCircumstances = watch("otherCircumstances");
  const hasDBS = watch("hasDBS");
  const dbsEnhanced = watch("dbsEnhanced");
  const dbsUpdate = watch("dbsUpdate");
  const offenceHistory = watch("offenceHistory");

  return (
    <div className="space-y-8">
      <RKSectionTitle title="Suitability & Vetting" description="We need to check your suitability to work with children." />

      <h3 className="rk-subsection-title">Previous Registration</h3>
      
      <p className="text-sm text-[#64748B] -mt-4 mb-6">
        Have you ever been registered with or applied to register with any of the following?
      </p>

      <RKRadio 
        legend="Ofsted" 
        required 
        name="prevRegOfsted" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={prevRegOfsted || ""} 
        onChange={(value) => setValue("prevRegOfsted", value as "Yes" | "No")} 
      />

      {prevRegOfsted === "Yes" && (
        <RegistrationBlock 
          form={form} 
          fieldName="prevRegOfstedDetails" 
          addLabel="Add Ofsted registration" 
        />
      )}

      <RKRadio 
        legend="Another Childminder Agency" 
        required 
        name="prevRegAgency" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={prevRegAgency || ""} 
        onChange={(value) => setValue("prevRegAgency", value as "Yes" | "No")} 
      />

      {prevRegAgency === "Yes" && (
        <RegistrationBlock 
          form={form} 
          fieldName="prevRegAgencyDetails" 
          addLabel="Add agency registration" 
        />
      )}

      <RKRadio 
        legend="Another regulatory authority in the UK (e.g., Scotland, Wales, Northern Ireland)" 
        required 
        name="prevRegOtherUK" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={prevRegOtherUK || ""} 
        onChange={(value) => setValue("prevRegOtherUK", value as "Yes" | "No")} 
      />

      {prevRegOtherUK === "Yes" && (
        <RegistrationBlock 
          form={form} 
          fieldName="prevRegOtherUKDetails" 
          addLabel="Add registration" 
        />
      )}

      <RKRadio 
        legend="A regulatory body in a European Union member state" 
        required 
        name="prevRegEU" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={prevRegEU || ""} 
        onChange={(value) => setValue("prevRegEU", value as "Yes" | "No")} 
      />

      {prevRegEU === "Yes" && (
        <RegistrationBlock 
          form={form} 
          fieldName="prevRegEUDetails" 
          addLabel="Add registration" 
        />
      )}

      <div className="rk-divider" />

      <h3 className="rk-subsection-title">Health Declaration</h3>

      <RKRadio 
        legend="Do you have any current or previous medical conditions (physical or mental) that may impact your ability to work as a childminder?" 
        hint="This includes significant mental health conditions, neurological conditions, or physical impairments."
        required 
        name="healthCondition" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={healthCondition || ""} 
        onChange={(value) => setValue("healthCondition", value as "Yes" | "No")} 
      />
      
      {healthCondition === "Yes" && (
        <RKTextarea 
          label="Please provide details" 
          hint="This information will be treated confidentially and is used to ensure appropriate support can be provided."
          required 
          rows={4} 
          {...register("healthConditionDetails")} 
        />
      )}

      <RKInfoBox type="info">
        It is a legal requirement that no one smokes in any part of a premises used for childminding, or in the presence of minded children.
      </RKInfoBox>

      <RKRadio 
        legend="Is anyone who lives or works at the premises a smoker?" 
        required 
        name="smoker" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={smoker || ""} 
        onChange={(value) => setValue("smoker", value as "Yes" | "No")} 
      />

      <div className="rk-divider" />
      
      <h3 className="rk-subsection-title">Suitability Declaration</h3>

      <RKInfoBox type="info">
        You are 'disqualified' if you have been barred from working with children, had a child removed from your care by court order, or had a registration cancelled in the past. Please review the official GOV.UK guidance if unsure.
      </RKInfoBox>

      <RKRadio 
        legend="Are you disqualified under the Childcare Act 2006?" 
        required 
        name="disqualified" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={disqualified || ""} 
        onChange={(value) => setValue("disqualified", value as "Yes" | "No")} 
      />

      {disqualified === "Yes" && (
        <RKInfoBox type="error">
          If you are disqualified, you cannot register as a childminder unless you have obtained a waiver from Ofsted. Please contact us to discuss your situation.
        </RKInfoBox>
      )}

      <RKInfoBox type="info">
        You must declare any involvement, including referrals, assessments, or investigations, even if the case was closed with no action. Past involvement does not automatically disqualify you, but we must explore the circumstances.
      </RKInfoBox>

      <RKRadio 
        legend="Have you ever been involved with social services in connection with your own children?" 
        required 
        name="socialServices" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={socialServices || ""} 
        onChange={(value) => setValue("socialServices", value as "Yes" | "No")} 
      />
      
      {socialServices === "Yes" && (
        <RKTextarea 
          label="Please provide details" 
          required 
          rows={4} 
          {...register("socialServicesDetails")} 
        />
      )}

      <RKRadio 
        legend="Are you aware of any other circumstances that might affect your suitability to care for children?" 
        required 
        name="otherCircumstances" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={otherCircumstances || ""} 
        onChange={(value) => setValue("otherCircumstances", value as "Yes" | "No")} 
      />
      
      {otherCircumstances === "Yes" && (
        <RKTextarea 
          label="Please provide details" 
          required 
          rows={4} 
          {...register("otherCircumstancesDetails")} 
        />
      )}

      <div className="rk-divider" />
      
      <h3 className="rk-subsection-title">DBS & Vetting</h3>

      <RKInfoBox type="info">
        An Enhanced DBS (Disclosure and Barring Service) check is mandatory for registration.
      </RKInfoBox>

      <RKRadio 
        legend="Do you currently hold an Enhanced DBS certificate dated within the last 3 years?" 
        required 
        name="hasDBS" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={hasDBS || ""} 
        onChange={(value) => setValue("hasDBS", value as "Yes" | "No")} 
      />

      {hasDBS === "Yes" && (
        <div className="p-5 bg-rk-bg-form border border-rk-border rounded-xl space-y-6">
          <RKInput 
            label="DBS certificate number" 
            hint="12-digit number found on your certificate"
            required 
            widthClass="20" 
            {...register("dbsNumber")} 
          />

          <RKRadio 
            legend="Is the certificate an Enhanced check with barred lists for a home-based role?" 
            required 
            name="dbsEnhanced" 
            options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
            value={dbsEnhanced || ""} 
            onChange={(value) => setValue("dbsEnhanced", value as "Yes" | "No")} 
          />

          {dbsEnhanced === "No" && (
            <RKInfoBox type="error">
              If your DBS check is not Enhanced, or does not include barred lists for a home-based role, you will need to apply for a new one.
            </RKInfoBox>
          )}

          <RKRadio 
            legend="Are you subscribed to the DBS Update Service?" 
            required 
            name="dbsUpdate" 
            options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
            value={dbsUpdate || ""} 
            onChange={(value) => setValue("dbsUpdate", value as "Yes" | "No")} 
          />

          {dbsUpdate === "No" && (
            <RKInfoBox type="error">
              You must sign up for the DBS Update Service. Your application cannot be completed until you are subscribed.
            </RKInfoBox>
          )}
        </div>
      )}

      {hasDBS === "No" && (
        <RKInfoBox type="info">
          You must obtain an Enhanced DBS check suitable for a home-based childcare role and subscribe to the Update Service before we can complete your registration. We can assist you with this process.
        </RKInfoBox>
      )}

      <div className="rk-divider" />

      <h3 className="rk-subsection-title">Criminal History Declaration</h3>

      <RKInfoBox type="info">
        You must declare everything, no matter how long ago it occurred. Due to the nature of working with children, the rules on 'spent' convictions (Rehabilitation of Offenders Act) do not apply. This information will be verified by your DBS check.
      </RKInfoBox>

      <RKRadio 
        legend="Have you ever received a reprimand or final warning, been given a caution for, or been convicted of, any criminal offences?" 
        required 
        name="offenceHistory" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={offenceHistory || ""} 
        onChange={(value) => setValue("offenceHistory", value as "Yes" | "No")} 
      />

      {offenceHistory === "Yes" && (
        <OffenceBlock form={form} />
      )}
    </div>
  );
};
