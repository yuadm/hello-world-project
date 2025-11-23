import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ChildminderApplication } from '@/types/childminder';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: 2,
    borderBottomColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: 1,
    borderBottomColor: '#333333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
    color: '#333333',
  },
  value: {
    width: '60%',
    color: '#000000',
  },
  table: {
    marginTop: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#dddddd',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
    padding: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    borderTop: 1,
    borderTopColor: '#dddddd',
    paddingTop: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listItem: {
    marginLeft: 15,
    marginBottom: 3,
  },
});

interface ApplicationPDFProps {
  application: Partial<ChildminderApplication>;
  applicationId: string;
  submittedDate: string;
  status: string;
}

export const ApplicationPDF = ({ application, applicationId, submittedDate, status }: ApplicationPDFProps) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return date;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>Ready Kids</Text>
          <Text style={styles.title}>Childminder Application</Text>
          <Text style={styles.subtitle}>
            Application ID: {applicationId} | Status: {status.toUpperCase()} | Submitted: {formatDate(submittedDate)}
          </Text>
        </View>

        {/* Section 1: Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Personal Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>
              {application.title} {application.firstName} {application.middleNames || ''} {application.lastName}
            </Text>
          </View>
          {application.previousNames && application.previousNames.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Previous Names:</Text>
              <View style={styles.value}>
                {application.previousNames.map((name: any, idx: number) => (
                  <Text key={idx} style={styles.listItem}>
                    {name.fullName} ({name.dateFrom} to {name.dateTo})
                  </Text>
                ))}
              </View>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{application.gender || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{formatDate(application.dob)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>National Insurance:</Text>
            <Text style={styles.value}>{application.niNumber || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{application.email || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{application.phone || 'N/A'}</Text>
          </View>
        </View>

        {/* Section 2: Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Address History</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Current Address:</Text>
            <Text style={styles.value}>
              {application.homeAddress?.line1}, {application.homeAddress?.line2 ? `${application.homeAddress.line2}, ` : ''}
              {application.homeAddress?.town}, {application.homeAddress?.postcode}
            </Text>
          </View>
          {application.addressHistory && application.addressHistory.length > 0 && (
            <View style={styles.table}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>Previous Addresses (5 Year History):</Text>
              {application.addressHistory.map((addr: any, idx: number) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={{ fontSize: 9, marginBottom: 2 }}>
                    {addr.address?.line1}, {addr.address?.town}, {addr.address?.postcode}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#666666' }}>
                    From {addr.moveIn} to {addr.moveOut}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 3: Premises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Premises Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Local Authority:</Text>
            <Text style={styles.value}>{application.localAuthority || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Premises Type:</Text>
            <Text style={styles.value}>{application.premisesType || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Childcare Address:</Text>
            <Text style={styles.value}>
              {application.childcareAddress?.line1}, {application.childcareAddress?.town}, {application.childcareAddress?.postcode}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pets:</Text>
            <Text style={styles.value}>{application.pets || 'N/A'}</Text>
          </View>
          {application.petsDetails && (
            <View style={styles.row}>
              <Text style={styles.label}>Pet Details:</Text>
              <Text style={styles.value}>{application.petsDetails}</Text>
            </View>
          )}
        </View>

        {/* Section 4: Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Service Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Age Groups:</Text>
            <Text style={styles.value}>{application.ageGroups?.join(', ') || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Capacity (Under 1):</Text>
            <Text style={styles.value}>{application.proposedUnder1 || '0'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Capacity (1-5):</Text>
            <Text style={styles.value}>{application.proposedUnder5 || '0'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Capacity (5-8):</Text>
            <Text style={styles.value}>{application.proposed5to8 || '0'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Capacity (8+):</Text>
            <Text style={styles.value}>{application.proposed8plus || '0'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Operating Times:</Text>
            <Text style={styles.value}>{application.childcareTimes?.join(', ') || 'N/A'}</Text>
          </View>
        </View>

        {/* Section 5: Qualifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Qualifications & Training</Text>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>First Aid:</Text>
          <View style={styles.listItem}>
            <Text style={{ fontSize: 9 }}>Completed: {application.firstAid?.completed || 'N/A'}</Text>
            {application.firstAid?.completed === 'Yes' && (
              <>
                <Text style={{ fontSize: 9 }}>Date: {formatDate(application.firstAid?.completionDate)}</Text>
                <Text style={{ fontSize: 9 }}>Provider: {application.firstAid?.provider || 'N/A'}</Text>
              </>
            )}
          </View>
          
          {application.safeguarding && (
            <>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 5, marginBottom: 5 }}>Safeguarding:</Text>
              <View style={styles.listItem}>
                <Text style={{ fontSize: 9 }}>Completed: {application.safeguarding.completed || 'N/A'}</Text>
                {application.safeguarding.completed === 'Yes' && (
                  <>
                    <Text style={{ fontSize: 9 }}>Date: {formatDate(application.safeguarding.completionDate)}</Text>
                    <Text style={{ fontSize: 9 }}>Provider: {application.safeguarding.provider || 'N/A'}</Text>
                  </>
                )}
              </View>
            </>
          )}

          {application.eyfsChildminding && (
            <>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 5, marginBottom: 5 }}>EYFS/Childminding Course:</Text>
              <View style={styles.listItem}>
                <Text style={{ fontSize: 9 }}>Completed: {application.eyfsChildminding.completed || 'N/A'}</Text>
                {application.eyfsChildminding.completed === 'Yes' && (
                  <>
                    <Text style={{ fontSize: 9 }}>Date: {formatDate(application.eyfsChildminding.completionDate)}</Text>
                    <Text style={{ fontSize: 9 }}>Provider: {application.eyfsChildminding.provider || 'N/A'}</Text>
                  </>
                )}
              </View>
            </>
          )}

          {application.level2Qual && (
            <>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 5, marginBottom: 5 }}>Level 2 Qualification:</Text>
              <View style={styles.listItem}>
                <Text style={{ fontSize: 9 }}>Completed: {application.level2Qual.completed || 'N/A'}</Text>
                {application.level2Qual.completed === 'Yes' && (
                  <>
                    <Text style={{ fontSize: 9 }}>Date: {formatDate(application.level2Qual.completionDate)}</Text>
                    <Text style={{ fontSize: 9 }}>Provider: {application.level2Qual.provider || 'N/A'}</Text>
                  </>
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text>Application ID: {applicationId} | Ready Kids Childminder Application | Page 2</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 6: Employment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Employment History</Text>
          {application.employmentHistory && application.employmentHistory.length > 0 ? (
            application.employmentHistory.map((emp: any, idx: number) => (
              <View key={idx} style={styles.listItem}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{emp.employer}</Text>
                <Text style={{ fontSize: 9 }}>Role: {emp.role}</Text>
                <Text style={{ fontSize: 9 }}>From {emp.dateFrom} to {emp.dateTo}</Text>
                {emp.reasonForLeaving && <Text style={{ fontSize: 9 }}>Reason: {emp.reasonForLeaving}</Text>}
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 9 }}>No employment history provided</Text>
          )}
        </View>

        {/* Section 7: People */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Household Members</Text>
          {application.adults && application.adults.length > 0 && (
            <>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>Adults:</Text>
              {application.adults.map((adult: any, idx: number) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={{ fontSize: 9 }}>
                    {adult.fullName} (Age {adult.age}, {adult.relationship})
                  </Text>
                </View>
              ))}
            </>
          )}
          {application.children && application.children.length > 0 && (
            <>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 5, marginBottom: 5 }}>Children:</Text>
              {application.children.map((child: any, idx: number) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={{ fontSize: 9 }}>
                    {child.fullName} (Age {child.age}, {child.relationship})
                  </Text>
                </View>
              ))}
            </>
          )}
          {application.assistants && application.assistants.length > 0 && (
            <>
              <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 5, marginBottom: 5 }}>Assistants:</Text>
              {application.assistants.map((assistant: any, idx: number) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={{ fontSize: 9 }}>
                    {assistant.fullName} (Age {assistant.age}, {assistant.relationship})
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Section 8: Suitability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Suitability & Background</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Health Conditions:</Text>
            <Text style={styles.value}>{application.healthCondition || 'N/A'}</Text>
          </View>
          {application.healthConditionDetails && (
            <View style={styles.row}>
              <Text style={styles.label}>Details:</Text>
              <Text style={styles.value}>{application.healthConditionDetails}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Criminal Convictions:</Text>
            <Text style={styles.value}>{application.offenceHistory || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Safeguarding Concerns:</Text>
            <Text style={styles.value}>{application.socialServices || 'N/A'}</Text>
          </View>
          {application.socialServicesDetails && (
            <View style={styles.row}>
              <Text style={styles.label}>Details:</Text>
              <Text style={styles.value}>{application.socialServicesDetails}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Previous Registration:</Text>
            <Text style={styles.value}>{application.prevRegOfsted || 'N/A'}</Text>
          </View>
        </View>

        {/* Section 9: Declaration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Declaration</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Declaration Confirmed:</Text>
            <Text style={styles.value}>{application.declarationAccuracy ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Signature:</Text>
            <Text style={styles.value}>{application.signatureFullName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(application.signatureDate)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Application ID: {applicationId} | Ready Kids Childminder Application | Page 3</Text>
        </View>
      </Page>
    </Document>
  );
};
