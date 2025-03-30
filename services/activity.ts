import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Activity, NewActivityInput } from '../types/activity';

// Create a new activity
export async function createActivity(activityData: NewActivityInput): Promise<Activity> {
  try {
    const activitiesRef = collection(db, 'activities');
    
    const activityWithDate = {
      ...activityData,
      date: serverTimestamp(),
    };

    const docRef = await addDoc(activitiesRef, activityWithDate);
    const activityDoc = await getDoc(docRef);

    if (!activityDoc.exists()) {
      throw new Error('Failed to create activity');
    }

    return {
      id: activityDoc.id,
      ...activityDoc.data()
    } as Activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
}

// Get recent activities for a user
export async function getRecentActivities(userId: string, maxResults: number = 10): Promise<Activity[]> {
  try {
    const activitiesRef = collection(db, 'activities');
    // First get all activities for the user
    const q = query(
      activitiesRef,
      where('user_id', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    // Then sort them in memory
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Activity));

    // Sort by date descending and limit the results
    return activities
      .sort((a, b) => b.date.seconds - a.date.seconds)
      .slice(0, maxResults);
  } catch (error) {
    console.error('Error getting recent activities:', error);
    throw error;
  }
}

// Create a deposit activity
export async function createDepositActivity(
  userId: string,
  amount: number,
  status: 'pending' | 'completed' | 'failed' = 'completed',
  paymentId?: string
): Promise<Activity> {
  return createActivity({
    type: 'deposit',
    amount,
    status,
    user_id: userId,
    description: `Deposit of $${amount.toFixed(2)}`,
    reference_id: paymentId
  });
} 