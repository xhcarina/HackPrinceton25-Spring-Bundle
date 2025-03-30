import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Text } from '../../components/Themed';
import { colors, useTheme } from '../../constants/theme';
import { LoanCard } from '../../components/LoanCard';
import { Loan, NewLoanInput, NewLoanInputSchema, CurrencySchema } from '../../types/loan';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { z } from 'zod';
import { Dropdown } from '../../components/ui/Dropdown';

const MAX_AMOUNT = 10000;
const MAX_DURATION_WEEKS = 104; // 2 years

export default function LoansScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    purpose: false,
    loaned_amount: false,
    loan_duration: false,
  });
  const [newLoan, setNewLoan] = useState<NewLoanInput>({
    purpose: '',
    loaned_amount: '',
    loan_duration: '',
    payment_schedule: 'monthly',
    currency: 'USD',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loanTerms, setLoanTerms] = useState({
    interestRate: 0,
    monthlyPayment: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchLoans();
    }
  }, [user?.id]);

  const fetchLoans = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available yet');
        return;
      }

      const loansRef = collection(db, 'loans');
      const q = query(loansRef, where('user_id', '==', user.id));
      const querySnapshot = await getDocs(q);
      
      const loanData: Loan[] = [];
      querySnapshot.forEach((doc) => {
        loanData.push({ id: doc.id, ...doc.data() } as Loan);
      });
      
      setLoans(loanData);
    } catch (error) {
      console.error('Error fetching loans:', error);
      Alert.alert('Error', 'Failed to fetch loans. Please try again.');
    }
  };

  const calculateLoanTerms = (amount: number, duration: number) => {
    // Simple interest calculation (you might want to use a more complex formula)
    const annualInterestRate = 0.12; // 12% annual interest rate
    const monthlyInterestRate = annualInterestRate / 12;
    const numberOfPayments = duration / 4; // Assuming monthly payments

    const monthlyPayment = (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    return {
      interestRate: annualInterestRate * 100,
      monthlyPayment,
    };
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (touchedFields.purpose && !newLoan.purpose.trim()) {
      newErrors.purpose = 'Please enter a purpose for the loan';
    }

    if (touchedFields.loaned_amount) {
      const amount = parseFloat(newLoan.loaned_amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.loaned_amount = 'Please enter a valid amount';
      } else if (amount > MAX_AMOUNT) {
        newErrors.loaned_amount = `Maximum loan amount is $${MAX_AMOUNT}`;
      }
    }

    if (touchedFields.loan_duration) {
      const duration = parseInt(newLoan.loan_duration);
      if (isNaN(duration) || duration <= 0) {
        newErrors.loan_duration = 'Please enter a valid duration';
      } else if (duration > MAX_DURATION_WEEKS) {
        newErrors.loan_duration = 'Maximum loan duration is 2 years (104 weeks)';
      }
    }

    setErrors(newErrors);
    setIsStep1Valid(Object.keys(newErrors).length === 0);
  };

  // Update validation whenever form values change
  useEffect(() => {
    validateStep1();
  }, [newLoan.purpose, newLoan.loaned_amount, newLoan.loan_duration, touchedFields]);

  const handleFieldChange = (field: keyof typeof touchedFields, value: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    setNewLoan(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isStep1Valid) {
      const amount = parseFloat(newLoan.loaned_amount);
      const duration = parseInt(newLoan.loan_duration);
      const terms = calculateLoanTerms(amount, duration);
      setLoanTerms(terms);
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmitLoan = async () => {
    try {
      if (!termsAccepted) {
        Alert.alert('Error', 'Please accept the loan terms to continue');
        return;
      }

      // Validate form input
      const validatedInput = NewLoanInputSchema.parse(newLoan);
      
      const loanData = {
        user_id: user?.id,
        purpose: validatedInput.purpose,
        loaned_amount: parseFloat(validatedInput.loaned_amount),
        loan_duration: parseInt(validatedInput.loan_duration),
        payment_schedule: validatedInput.payment_schedule,
        request_status: 'pending',
        repay_status: 'pending',
        amount_repaid: 0,
        funded_amount: 0,
        currency: validatedInput.currency,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      } as const;

      await addDoc(collection(db, 'loans'), loanData);
      setIsModalVisible(false);
      setCurrentStep(1);
      setNewLoan({
        purpose: '',
        loaned_amount: '',
        loan_duration: '',
        payment_schedule: 'monthly',
        currency: 'USD',
      });
      setTermsAccepted(false);
      fetchLoans();
      Alert.alert('Success', 'Loan application submitted successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map((e) => e.message).join('\n');
        Alert.alert('Validation Error', errorMessage);
      } else {
        console.error('Error submitting loan:', error);
        Alert.alert('Error', 'Failed to submit loan application. Please try again.');
      }
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const renderStep1 = () => (
    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>Apply for a Loan</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(false)}>
          <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
        Step 1 of 2: Loan Details
      </Text>
      
      <View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text },
            touchedFields.purpose && errors.purpose && styles.inputError
          ]}
          placeholder="Purpose"
          placeholderTextColor={colors.textSecondary}
          value={newLoan.purpose}
          onChangeText={(text) => handleFieldChange('purpose', text)}
          multiline
          numberOfLines={4}
        />
        {touchedFields.purpose && errors.purpose && <Text style={styles.errorText}>{errors.purpose}</Text>}
      </View>
      
      <View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text },
            touchedFields.loaned_amount && errors.loaned_amount && styles.inputError
          ]}
          placeholder={`Amount (${getCurrencySymbol(newLoan.currency)})`}
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={newLoan.loaned_amount}
          onChangeText={(text) => {
            const formatted = text.replace(/[^0-9.]/g, '');
            handleFieldChange('loaned_amount', formatted);
          }}
        />
        {touchedFields.loaned_amount && errors.loaned_amount && <Text style={styles.errorText}>{errors.loaned_amount}</Text>}
      </View>
      
      <View>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text },
            touchedFields.loan_duration && errors.loan_duration && styles.inputError
          ]}
          placeholder="Duration (weeks)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={newLoan.loan_duration}
          onChangeText={(text) => {
            const formatted = text.replace(/[^0-9]/g, '');
            handleFieldChange('loan_duration', formatted);
          }}
        />
        {touchedFields.loan_duration && errors.loan_duration && <Text style={styles.errorText}>{errors.loan_duration}</Text>}
      </View>

      <Dropdown
        label="Currency"
        value={newLoan.currency}
        onValueChange={(value) => setNewLoan({ ...newLoan, currency: value as z.infer<typeof CurrencySchema> })}
        options={[
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
        ]}
        placeholder="Select currency"
      />

      <Button
        onPress={handleNext}
        title="Next"
        variant="primary"
        disabled={!isStep1Valid}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Loan Terms</Text>
        <TouchableOpacity onPress={() => setIsModalVisible(false)}>
          <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
        Step 2 of 2: Review and Accept
      </Text>

      <View style={styles.termsContainer}>
        <Text style={[styles.termLabel, { color: colors.text }]}>Loan Amount</Text>
        <Text style={[styles.termValue, { color: colors.text }]}>
          {getCurrencySymbol(newLoan.currency)}{formatAmount(parseFloat(newLoan.loaned_amount))}
        </Text>

        <Text style={[styles.termLabel, { color: colors.text }]}>Interest Rate</Text>
        <Text style={[styles.termValue, { color: colors.text }]}>
          {loanTerms.interestRate.toFixed(2)}%
        </Text>

        <Text style={[styles.termLabel, { color: colors.text }]}>Monthly Payment</Text>
        <Text style={[styles.termValue, { color: colors.text }]}>
          {getCurrencySymbol(newLoan.currency)}{formatAmount(loanTerms.monthlyPayment)}
        </Text>

        <Text style={[styles.termLabel, { color: colors.text }]}>Duration</Text>
        <Text style={[styles.termValue, { color: colors.text }]}>
          {parseInt(newLoan.loan_duration)} weeks
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          style={{
            width: 20,
            height: 20,
            marginRight: 8,
            accentColor: colors.primary,
          }}
        />
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>
          I accept the loan terms and conditions
        </Text>
      </View>

      <View style={styles.modalButtons}>
        <Button
          onPress={handleBack}
          title="Back"
          variant="outline"
        />
        <Button
          onPress={handleSubmitLoan}
          title="Confirm Loan Request"
          variant="primary"
          disabled={!termsAccepted}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Your Loans</Text>
          <Button
            onPress={() => setIsModalVisible(true)}
            title="Apply for Loan"
            variant="primary"
          />
        </View>

        {loans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No loans found. Apply for your first loan!
            </Text>
          </View>
        ) : (
          loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => {
                // Handle loan details view
              }}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '600',
    padding: 8,
  },
  inputError: {
    borderWidth: 1,
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  termsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  termLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  termValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
}); 