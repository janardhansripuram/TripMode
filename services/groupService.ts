import { db, auth } from '@/config/firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { GroupData, GroupMemberData, ExpenseData, ExpenseShareData, SettlementData, GroupSummary } from '@/types';

// Group Management
export const createGroup = async (name: string, currency: string = 'USD', default_split_method: string = 'equal'): Promise<GroupData> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const groupData = {
    name,
    currency,
    default_split_method,
    created_at: Timestamp.now().toDate().toISOString(),
    updated_at: Timestamp.now().toDate().toISOString(),
  };

  const groupRef = await addDoc(collection(db, 'groups'), groupData);
  
  // Add creator as first member
  await addDoc(collection(db, 'group_members'), {
    group_id: groupRef.id,
    user_id: userId,
    joined_at: Timestamp.now().toDate().toISOString(),
    status: 'active'
  });

  return { id: groupRef.id, ...groupData };
};

export const getGroups = async (): Promise<GroupData[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const membershipQuery = query(
    collection(db, 'group_members'),
    where('user_id', '==', userId),
    where('status', '==', 'active')
  );

  const memberships = await getDocs(membershipQuery);
  const groupIds = memberships.docs.map(doc => doc.data().group_id);

  const groups: GroupData[] = [];
  for (const groupId of groupIds) {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      groups.push({ id: groupDoc.id, ...groupDoc.data() } as GroupData);
    }
  }

  return groups;
};

// Add other Firebase service functions here...