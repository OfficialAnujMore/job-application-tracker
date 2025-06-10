import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  DocumentReference,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../Config/firebase';
import { JobApplication } from '../Types';
import { validateJobApplication, ValidationError } from './validation';

interface FirebaseError {
  code: string;
  message: string;
}

export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public validationErrors?: ValidationError[]
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

const handleFirebaseError = (error: FirebaseError): ApplicationError => {
  switch (error.code) {
    case 'permission-denied':
      return new ApplicationError(
        'You do not have permission to perform this action',
        'PERMISSION_DENIED'
      );
    case 'not-found':
      return new ApplicationError(
        'The requested resource was not found',
        'NOT_FOUND'
      );
    case 'already-exists':
      return new ApplicationError(
        'A resource with this identifier already exists',
        'ALREADY_EXISTS'
      );
    default:
      return new ApplicationError(
        'An unexpected error occurred. Please try again.',
        'UNKNOWN_ERROR'
      );
  }
};

export const addApplication = async (data: Omit<JobApplication, 'id' | 'userId'>): Promise<string> => {
  if (!auth.currentUser) {
    throw new ApplicationError('You must be logged in to add an application', 'UNAUTHENTICATED');
  }

  // Validate the data
  const validationErrors = validateJobApplication(data);
  if (validationErrors.length > 0) {
    throw new ApplicationError(
      'Invalid application data',
      'VALIDATION_ERROR',
      validationErrors
    );
  }

  try {
    const docRef = await addDoc(collection(db, 'applications'), {
      ...data,
      userId: auth.currentUser.uid,
      lastUpdated: Timestamp.now().toDate().toISOString()
    });
    return docRef.id;
  } catch (error) {
    throw handleFirebaseError(error as FirebaseError);
  }
};

export const updateApplication = async (
  id: string,
  data: Partial<Omit<JobApplication, 'id' | 'userId'>>
): Promise<void> => {
  if (!auth.currentUser) {
    throw new ApplicationError('You must be logged in to update an application', 'UNAUTHENTICATED');
  }

  // Validate the data
  const validationErrors = validateJobApplication(data);
  if (validationErrors.length > 0) {
    throw new ApplicationError(
      'Invalid application data',
      'VALIDATION_ERROR',
      validationErrors
    );
  }

  try {
    const docRef = doc(db, 'applications', id) as DocumentReference<JobApplication>;
    await updateDoc(docRef, {
      ...data,
      lastUpdated: Timestamp.now().toDate().toISOString()
    });
  } catch (error) {
    throw handleFirebaseError(error as FirebaseError);
  }
};

export const deleteApplication = async (id: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new ApplicationError('You must be logged in to delete an application', 'UNAUTHENTICATED');
  }

  try {
    await deleteDoc(doc(db, 'applications', id));
  } catch (error) {
    throw handleFirebaseError(error as FirebaseError);
  }
};

export const getApplications = async (
  startDate?: Date,
  endDate?: Date
): Promise<JobApplication[]> => {
  if (!auth.currentUser) {
    throw new ApplicationError('You must be logged in to fetch applications', 'UNAUTHENTICATED');
  }

  try {
    let q = query(
      collection(db, 'applications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('dateApplied', 'desc')
    );

    if (startDate) {
      q = query(q, where('dateApplied', '>=', startDate.toISOString()));
    }
    if (endDate) {
      q = query(q, where('dateApplied', '<=', endDate.toISOString()));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as JobApplication));
  } catch (error) {
    throw handleFirebaseError(error as FirebaseError);
  }
}; 