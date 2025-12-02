import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  addressBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
    backgroundColor: '#000',
  },
  emptySection: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 20,
    marginTop: 10,
    backgroundColor: '#fafafa',
  },
  emptySectionText: {
    color: '#999',
    fontSize: 9,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 30,
    fontSize: 8,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
});

interface KnownToOfstedPDFProps {
  applicantName: string;
  previousNames?: Array<{ name: string; dateFrom: string; dateTo: string }>;
  dateOfBirth: string;
  currentAddress: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveInDate: string;
  };
  previousAddresses?: Array<{
    address: string;
    dateFrom: string;
    dateTo: string;
  }>;
  role: 'childminder' | 'household_member' | 'assistant' | 'manager' | 'nominated_individual';
  requestDate: string;
  requesterName: string;
  requesterRole: string;
  requireChildInfo: boolean;
  agencyName?: string;
  ofstedEmail?: string;
}

export const KnownToOfstedPDF = ({
  applicantName,
  previousNames,
  dateOfBirth,
  currentAddress,
  previousAddresses,
  role,
  requestDate,
  requesterName,
  requesterRole,
  requireChildInfo,
  agencyName = 'Childminder Agency',
  ofstedEmail = 'childminder.agencies@ofsted.gov.uk',
}: KnownToOfstedPDFProps) => {
  const roleLabels: Record<string, string> = {
    childminder: 'Childminder/Sole Proprietor',
    household_member: 'Household Member over 16',
    assistant: 'Assistant',
    manager: 'Manager',
    nominated_individual: 'Nominated Individual',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Ofsted</Text>
          <Text style={styles.subtitle}>Raising standards, improving lives</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>
          Known to Ofsted Application Form
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section A: Applicant Details (To be completed by agency)</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Applicant full name:</Text>
            <Text style={styles.value}>{applicantName || 'N/A'}</Text>
          </View>

          {previousNames && previousNames.length > 0 ? (
            <View style={styles.row}>
              <Text style={styles.label}>Previous surname(s):</Text>
              <View style={styles.value}>
                {previousNames.map((prev, idx) => (
                  <Text key={idx}>{prev.name || 'N/A'} ({prev.dateFrom || 'N/A'} to {prev.dateTo || 'N/A'})</Text>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.label}>Date of birth:</Text>
            <Text style={styles.value}>{dateOfBirth || 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Current address:</Text>
            <View style={styles.addressBox}>
              <Text>{currentAddress?.line1 || 'Not provided'}</Text>
              {currentAddress?.line2 ? <Text>{currentAddress.line2}</Text> : null}
              <Text>{currentAddress?.town || 'Not provided'}</Text>
              <Text>{currentAddress?.postcode || 'Not provided'}</Text>
              <Text style={{ marginTop: 5, fontSize: 9 }}>Date from: {currentAddress?.moveInDate || 'N/A'}</Text>
            </View>
          </View>

          {previousAddresses && previousAddresses.length > 0 ? (
            <View style={styles.row}>
              <Text style={styles.label}>Previous addresses (last 5 years):</Text>
              <View style={styles.value}>
                {previousAddresses.map((addr, idx) => (
                  <View key={idx} style={styles.addressBox}>
                    <Text>{addr.address || 'N/A'}</Text>
                    <Text style={{ fontSize: 9, marginTop: 3 }}>
                      {addr.dateFrom || 'N/A'} to {addr.dateTo || 'N/A'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.label}>Date of request to Ofsted:</Text>
            <Text style={styles.value}>{requestDate || 'N/A'}</Text>
          </View>

          <View style={{ marginTop: 15, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Applicant role (please tick):</Text>
            {Object.entries(roleLabels).map(([key, label]) => (
              <View key={key} style={styles.checkboxRow}>
                <View style={role === key ? styles.checkboxChecked : styles.checkbox} />
                <Text>{label}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 15, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Is information required on the number and ages of children involved in any past Ofsted judgement?
            </Text>
            <View style={styles.checkboxRow}>
              <View style={requireChildInfo ? styles.checkboxChecked : styles.checkbox} />
              <Text>Yes</Text>
            </View>
            <View style={styles.checkboxRow}>
              <View style={!requireChildInfo ? styles.checkboxChecked : styles.checkbox} />
              <Text>No</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Name of requester:</Text>
            <Text style={styles.value}>{requesterName || 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Role at childminder agency:</Text>
            <Text style={styles.value}>{requesterRole || 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Agency name:</Text>
            <Text style={styles.value}>{agencyName || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section B: For Ofsted to Complete</Text>
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>
              This section will be completed by Ofsted to indicate whether the applicant is known to them.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section C: Additional Information (If applicable)</Text>
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>
              Ofsted will provide relevant information here if the applicant is known to them.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section D: Data Protection Statement</Text>
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>
              Ofsted will complete this section with relevant data protection information.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Generated: {new Date().toLocaleDateString('en-GB')}</Text>
          <Text>Form version: May 2022</Text>
          <Text style={{ marginTop: 5 }}>
            This form should be sent to: {ofstedEmail || 'childminder.agencies@ofsted.gov.uk'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};