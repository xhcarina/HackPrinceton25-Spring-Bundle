import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Bundle as BundleType, NewBundleInput } from '../types/bundle';

class Bundle implements BundleType {
  id: string;
  loan_ids: string[];
  M: number;
  bundle_id: number;
  bundle_name: string;
  bundle_description: string;
  bundle_status: boolean;
  bundle_value: number;
  bundle_created_at: Timestamp;
  bundle_end_date: Timestamp;
  private _i_rate: number;

  constructor(data: BundleType) {
    this.id = data.id;
    this.loan_ids = data.loan_ids;
    this.M = data.M;
    this.bundle_id = data.bundle_id;
    this.bundle_name = data.bundle_name;
    this.bundle_description = data.bundle_description;
    this.bundle_status = data.bundle_status;
    this.bundle_value = data.bundle_value;
    this.bundle_created_at = data.bundle_created_at;
    this.bundle_end_date = data.bundle_end_date;
    this._i_rate = data.i_rate;
  }

  // Getter for i_rate
  get i_rate(): number {
    return this._i_rate;
  }

  // Calculate and set the bundle interest rate
  async calculateBundleInterestRate(): Promise<number> {
    try {
      let totalDefaultRate = 0;
      const loanPromises = this.loan_ids.map(loanId => 
        getDoc(doc(db, 'loans', loanId))
      );
      
      const loanDocs = await Promise.all(loanPromises);
      
      for (const loanDoc of loanDocs) {
        if (!loanDoc.exists()) {
          throw new Error(`Loan ${loanDoc.id} not found`);
        }
        const loanData = loanDoc.data();
        totalDefaultRate += loanData.default_rate || 0;
      }

      const avgDefaultRate = totalDefaultRate / this.loan_ids.length;
      this._i_rate = ((1 + this.M) / (1 - avgDefaultRate)) - 1;
      
      return this._i_rate;
    } catch (error) {
      console.error('Error calculating bundle interest rate:', error);
      throw error;
    }
  }

  // Convert to plain object for Firestore
  toFirestore(): Omit<BundleType, 'id'> {
    return {
      loan_ids: this.loan_ids,
      M: this.M,
      bundle_id: this.bundle_id,
      bundle_name: this.bundle_name,
      bundle_description: this.bundle_description,
      bundle_status: this.bundle_status,
      bundle_value: this.bundle_value,
      bundle_created_at: this.bundle_created_at,
      bundle_end_date: this.bundle_end_date,
      i_rate: this._i_rate,
    };
  }
}

// Create a new bundle
export async function createBundle(bundleData: NewBundleInput): Promise<BundleType> {
  try {
    // Get the next bundle ID
    const bundlesRef = collection(db, 'bundles');
    const bundlesQuery = query(bundlesRef, orderBy('bundle_id', 'desc'));
    const bundlesSnapshot = await getDocs(bundlesQuery);
    const nextBundleId = bundlesSnapshot.empty ? 1 : bundlesSnapshot.docs[0].data().bundle_id + 1;

    // Create bundle instance
    const bundle = new Bundle({
      id: 'temp', // Will be replaced with Firestore ID
      ...bundleData,
      bundle_id: nextBundleId,
      bundle_status: true,
      bundle_created_at: Timestamp.fromMillis(Date.now()),
      bundle_end_date: Timestamp.fromDate(bundleData.bundle_end_date),
      i_rate: 0
    });

    // Calculate interest rate
    await bundle.calculateBundleInterestRate();

    // Add the bundle to Firestore
    const docRef = await addDoc(bundlesRef, bundle.toFirestore());
    
    // Get the created bundle
    const bundleDoc = await getDoc(docRef);
    if (!bundleDoc.exists()) {
      throw new Error('Failed to create bundle');
    }

    return {
      id: bundleDoc.id,
      ...bundleDoc.data()
    } as BundleType;
  } catch (error) {
    console.error('Error creating bundle:', error);
    throw error;
  }
}

// Get a bundle by ID with calculated interest rate
export async function getBundle(bundleId: string): Promise<BundleType | null> {
  try {
    const bundleDoc = await getDoc(doc(db, 'bundles', bundleId));
    if (!bundleDoc.exists()) {
      return null;
    }

    const bundle = new Bundle({
      id: bundleDoc.id,
      ...bundleDoc.data()
    } as BundleType);

    // Recalculate interest rate
    await bundle.calculateBundleInterestRate();

    return bundle.toFirestore() as BundleType;
  } catch (error) {
    console.error('Error getting bundle:', error);
    throw error;
  }
}

// Get all active bundles with calculated interest rates
export async function getActiveBundles(): Promise<BundleType[]> {
  try {
    const bundlesRef = collection(db, 'bundles');
    const q = query(
      bundlesRef,
      where('bundle_status', '==', true),
      orderBy('bundle_created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const bundles = await Promise.all(
      querySnapshot.docs.map(async doc => {
        const bundle = new Bundle({
          id: doc.id,
          ...doc.data()
        } as BundleType);
        await bundle.calculateBundleInterestRate();
        return bundle.toFirestore() as BundleType;
      })
    );

    return bundles;
  } catch (error) {
    console.error('Error getting active bundles:', error);
    throw error;
  }
}

// Update a bundle
export async function updateBundle(bundleId: string, updates: Partial<BundleType>): Promise<void> {
  try {
    const bundleRef = doc(db, 'bundles', bundleId);
    const bundleDoc = await getDoc(bundleRef);
    if (!bundleDoc.exists()) {
      throw new Error('Bundle not found');
    }

    const bundle = new Bundle({
      id: bundleId,
      ...bundleDoc.data(),
      ...updates,
    } as BundleType);

    // Recalculate interest rate if loan_ids or M is updated
    if (updates.loan_ids || updates.M !== undefined) {
      await bundle.calculateBundleInterestRate();
    }

    await updateDoc(bundleRef, bundle.toFirestore());
  } catch (error) {
    console.error('Error updating bundle:', error);
    throw error;
  }
}

// Delete a bundle
export async function deleteBundle(bundleId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'bundles', bundleId));
  } catch (error) {
    console.error('Error deleting bundle:', error);
    throw error;
  }
}

// Get bundles by loan ID
export async function getBundlesByLoanId(loanId: string): Promise<BundleType[]> {
  try {
    const bundlesRef = collection(db, 'bundles');
    const q = query(
      bundlesRef,
      where('loan_ids', 'array-contains', loanId),
      orderBy('bundle_created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const bundles = await Promise.all(
      querySnapshot.docs.map(async doc => {
        const bundle = new Bundle({
          id: doc.id,
          ...doc.data()
        } as BundleType);
        await bundle.calculateBundleInterestRate();
        return bundle.toFirestore() as BundleType;
      })
    );

    return bundles;
  } catch (error) {
    console.error('Error getting bundles by loan ID:', error);
    throw error;
  }
}

// Test bundle creation
export async function testBundleCreation(loans: string[], mValue: number = 1.5): Promise<BundleType> {
  try {
    console.log('Starting bundle creation test...');
    console.log('Using loans:', loans);
    console.log('Using M value:', mValue);

    const testBundleData: NewBundleInput = {
      loan_ids: loans,
      M: mValue, // Use the provided M value
      bundle_name: 'Test Bundle',
      bundle_description: 'A test bundle for verification',
      bundle_value: 10000, // Example value
      bundle_end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      i_rate: 0 // Will be calculated automatically
    };

    console.log('Creating bundle with data:', testBundleData);
    const createdBundle = await createBundle(testBundleData);
    console.log('Bundle created successfully:', createdBundle);
    console.log('Calculated interest rate:', createdBundle.i_rate);

    // Verify the bundle exists and can be retrieved
    const verifiedBundle = await getBundle(createdBundle.id);
    console.log('Bundle verification:', verifiedBundle ? 'Success' : 'Failed');

    return createdBundle;
  } catch (error) {
    console.error('Bundle creation test failed:', error);
    throw error;
  }
} 