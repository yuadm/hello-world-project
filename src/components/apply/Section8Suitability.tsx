import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKInput, RKRadio, RKTextarea, RKSectionTitle, RKInfoBox } from "./rk";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

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

      <RKRadio 
        legend="Another Childminder Agency" 
        required 
        name="prevRegAgency" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={prevRegAgency || ""} 
        onChange={(value) => setValue("prevRegAgency", value as "Yes" | "No")} 
      />

      <RKRadio 
        legend="Another regulatory authority in the UK (e.g., Scotland, Wales, Northern Ireland)" 
        required 
        name="prevRegOtherUK" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={prevRegOtherUK || ""} 
        onChange={(value) => setValue("prevRegOtherUK", value as "Yes" | "No")} 
      />

      <RKRadio 
        legend="A regulatory body in a European Union member state" 
        required 
        name="prevRegEU" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={prevRegEU || ""} 
        onChange={(value) => setValue("prevRegEU", value as "Yes" | "No")} 
      />

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

      <RKRadio 
        legend="Is anyone who lives or works at the premises a smoker?" 
        hint="It is a legal requirement that no one smokes in any part of a premises used for childminding, or in the presence of minded children."
        required 
        name="smoker" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={smoker || ""} 
        onChange={(value) => setValue("smoker", value as "Yes" | "No")} 
      />

      <div className="rk-divider" />
      
      <h3 className="rk-subsection-title">Suitability Declaration</h3>

      <RKRadio 
        legend="Are you disqualified under the Childcare Act 2006?" 
        hint="You are 'disqualified' if you have been barred from working with children, had a child removed from your care by court order, or had a registration cancelled in the past. Please review the official GOV.UK guidance if unsure."
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

      <RKRadio 
        legend="Have you ever been involved with social services in connection with your own children?" 
        hint="You must declare any involvement, including referrals, assessments, or investigations, even if the case was closed with no action. Past involvement does not automatically disqualify you, but we must explore the circumstances."
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
        <div className="p-5 bg-rk-bg-form border border-rk-border rounded-xl space-y-4">
          <RKInput 
            label="DBS certificate number" 
            hint="12-digit number found on your certificate"
            required 
            widthClass="20" 
            {...register("dbsNumber")} 
          />
        </div>
      )}

      {hasDBS === "No" && (
        <RKInfoBox type="info">
          You must obtain an Enhanced DBS check suitable for a home-based childcare role and subscribe to the Update Service before we can complete your registration. We can assist you with this process.
        </RKInfoBox>
      )}

      <div className="rk-divider" />

      <h3 className="rk-subsection-title">Criminal History Declaration</h3>

      <RKRadio 
        legend="Have you ever received a reprimand or final warning, been given a caution for, or been convicted of, any criminal offences?" 
        hint="You must declare everything, no matter how long ago it occurred. Due to the nature of working with children, the rules on 'spent' convictions (Rehabilitation of Offenders Act) do not apply. This information will be verified by your DBS check."
        required 
        name="offenceHistory" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={offenceHistory || ""} 
        onChange={(value) => setValue("offenceHistory", value as "Yes" | "No")} 
      />

      {offenceHistory === "Yes" && (
        <RKTextarea 
          label="Please provide details" 
          hint="Include dates, nature of offence(s), and any sentences or outcomes."
          required 
          rows={4} 
        />
      )}
    </div>
  );
};
