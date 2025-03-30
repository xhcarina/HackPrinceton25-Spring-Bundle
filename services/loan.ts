import { 
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Get count of active loans for a user
export const getActiveLoansCount = async (userId: string): Promise<number> => {
  try {
    const loansRef = collection(db, 'loans');
    const q = query(
      loansRef,
      where('user_id', '==', userId),
      where('request_status', 'in', ['pending', 'approved'])
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} active loans for user ${userId}`);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting active loans count:', error);
    throw error;
  }
};

export const makeLoanPayment = async (loanId: string, amount: number, userId: string): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      // Get the loan document
      const loanRef = doc(db, 'loans', loanId);
      const loanDoc = await transaction.get(loanRef);
      
      if (!loanDoc.exists()) {
        throw new Error('Loan not found');
      }

      // Get the user document
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const loanData = loanDoc.data();
      const userData = userDoc.data();
      
      const newAmountRepaid = (loanData.amount_repaid || 0) + amount;
      const isFullyRepaid = newAmountRepaid >= loanData.loaned_amount;
      const newBalance = (userData.balance || 0) - amount;

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }
      
      // Update the loan document
      transaction.update(loanRef, {
        amount_repaid: newAmountRepaid,
        updated_at: Timestamp.now(),
        // If fully repaid, update the status and sort order
        ...(isFullyRepaid ? {
          repay_status: 'paid',
          request_status: 'completed',
          sort_order: 1000, // High number to push to bottom of list
        } : {}),
      });

      // Update the user's balance
      transaction.update(userRef, {
        balance: newBalance,
        updated_at: Timestamp.now()
      });

      console.log(`Payment of ${amount} processed for loan ${loanId}. New amount repaid: ${newAmountRepaid}`);
      console.log(`User ${userId} balance updated to: ${newBalance}`);
      
      if (isFullyRepaid) {
        console.log(`Loan ${loanId} has been fully repaid and marked as completed`);
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export const getLoans = async (userId: string): Promise<any[]> => {
  try {
    const loansRef = collection(db, 'loans');
    let q;
    
    try {
      // Try with full sorting
      q = query(
        loansRef,
        where('user_id', '==', userId),
        orderBy('sort_order', 'asc'),
        orderBy('updated_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error: any) {
      // If index error, fall back to simple query
      if (error.code === 'failed-precondition') {
        console.log('Index not ready, falling back to basic query');
        q = query(
          loansRef,
          where('user_id', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const loans = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort in memory
        return loans.sort((a, b) => {
          // Sort by sort_order first
          const orderDiff = (a.sort_order || 0) - (b.sort_order || 0);
          if (orderDiff !== 0) return orderDiff;
          
          // Then by updated_at in descending order
          const aTime = a.updated_at?.toMillis() || 0;
          const bTime = b.updated_at?.toMillis() || 0;
          return bTime - aTime;
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting loans:', error);
    throw error;
  }
}; 