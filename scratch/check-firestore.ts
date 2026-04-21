
import { db } from './src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function checkEvents() {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    console.log(`Found ${querySnapshot.size} events in Firestore.`);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
    });
  } catch (e) {
    console.error('Error fetching events:', e);
  }
}

checkEvents();
