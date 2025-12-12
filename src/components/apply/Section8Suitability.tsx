import { UseFormReturn } from "react-hook-form";
import { ChildminderApplication } from "@/types/childminder";
import { RKInput, RKRadio, RKTextarea, RKSectionTitle, RKInfoBox } from "./rk";

interface Props {
  form: UseFormReturn<Partial<ChildminderApplication>>;
}

export const Section8Suitability = ({ form }: Props) => {
  const { register, watch, setValue } = form;
  
  const healthCondition = watch("healthCondition");
  const disqualified = watch("disqualified");
  const socialServices = watch("socialServices");
  const otherCircumstances = watch("otherCircumstances");
  const hasDBS = watch("hasDBS");

  return (
    <div className="space-y-8">
      <RKSectionTitle title="Suitability & Vetting" description="We need to check your suitability to work with children." />

      <h3 className="rk-subsection-title">Health Declaration</h3>

      <RKRadio 
        legend="Do you have any physical or mental health conditions that may impact your ability to care for children?" 
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
        required 
        name="smoker" 
        options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} 
        value={watch("smoker") || ""} 
        onChange={(value) => setValue("smoker", value as "Yes" | "No")} 
      />

      <div className="rk-divider" />
      
      <h3 className="rk-subsection-title">Suitability Declaration</h3>

      <RKRadio 
        legend="Are you disqualified from registration under the Childcare Act 2006?" 
        hint="This includes disqualification by association."
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
        All childminders must have an Enhanced DBS check with barred lists. If you don't already have one, we will arrange this for you as part of the registration process.
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
          No problem - we will arrange your DBS check as part of the registration process. There may be an additional fee for this service.
        </RKInfoBox>
      )}
    </div>
  );
};
