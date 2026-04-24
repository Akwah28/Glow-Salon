import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkDetails() {
  console.log("--- SETTINGS ---");
  const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
  if (settingsDoc.exists()) {
    console.log(JSON.stringify(settingsDoc.data(), null, 2));
  } else {
    console.log("No settings found.");
  }

  console.log("\n--- LATEST BOOKING ---");
  const bookingsSnap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(1)));
  if (!bookingsSnap.empty) {
    console.log(JSON.stringify(bookingsSnap.docs[0].data(), null, 2));
  } else {
    console.log("No bookings found.");
  }
  process.exit(0);
}

checkDetails().catch(console.error);
