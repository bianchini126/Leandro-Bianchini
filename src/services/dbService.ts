import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { db } from "../config/firebase";
import { UserData, Workout, WorkoutLog } from "../types";

export interface GymInvite {
  id?: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  status: 'pending' | 'accepted' | 'declined';
  gymName: string;
  timestamp: any;
}

export const dbService = {
  // Usuários
  async getUser(uid: string): Promise<UserData | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserData) : null;
  },

  async getUserByEmail(email: string): Promise<UserData | null> {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserData;
    }
    return null;
  },

  async createUser(uid: string, data: Partial<UserData>): Promise<void> {
    await setDoc(doc(db, "users", uid), {
      ...data,
      createdAt: serverTimestamp(),
      isPremium: data.isPremium || false,
      role: data.role || "student"
    });
  },

  async updateUser(uid: string, data: Partial<UserData>): Promise<void> {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // Busca de Academias Próximas (Gym Bro)
  async getNearbyUsers(lat: number, lng: number, radiusKm: number = 5): Promise<UserData[]> {
    // Nota: Firestore não tem busca geo nativa complexa sem bibliotecas extras (como geofire).
    // Para manter simples e gratuito hoje, faremos um filtro básico por proximidade numérica
    // ou buscaremos todos os que estão "buscando parceiro" e filtraremos no cliente.
    const q = query(
      collection(db, "users"), 
      where("is_searching_partner", "==", true),
      where("is_invisible", "==", false)
    );
    const querySnapshot = await getDocs(q);
    const users: UserData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as UserData;
      if (data.latitude && data.longitude) {
        // Cálculo de distância simples (Haversine seria melhor, mas aqui simplificamos)
        const distance = Math.sqrt(
          Math.pow(data.latitude - lat, 2) + Math.pow(data.longitude - lng, 2)
        ) * 111; // Aproximação grosseira de graus para km
        
        if (distance <= radiusKm) {
          users.push(data);
        }
      }
    });
    
    return users;
  },

  // Treinos
  async saveWorkout(userId: string, workout: any): Promise<void> {
    const docRef = doc(collection(db, "users", userId, "workouts"));
    await setDoc(docRef, {
      ...workout,
      createdAt: serverTimestamp()
    });
  },

  async getWorkouts(userId: string): Promise<any[]> {
    const q = query(collection(db, "users", userId, "workouts"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Logs de Nutrição
  async saveNutritionLog(userId: string, log: any): Promise<void> {
    const docRef = doc(collection(db, "users", userId, "nutrition_logs"));
    await setDoc(docRef, {
      ...log,
      timestamp: serverTimestamp()
    });
  },

  async getNutritionUsageToday(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, "users", userId, "nutrition_logs"),
      where("timestamp", ">=", today)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  },

  // Gym Bro - Convites e Match
  async sendGymInvite(invite: Omit<GymInvite, 'id' | 'timestamp'>): Promise<void> {
    const invitesRef = collection(db, "gym_invites");
    await setDoc(doc(invitesRef), {
      ...invite,
      timestamp: serverTimestamp()
    });
  },

  async getMyInvites(email: string): Promise<GymInvite[]> {
    const q = query(
      collection(db, "gym_invites"), 
      where("receiverId", "==", email),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GymInvite));
  },

  async respondInvite(inviteId: string, status: 'accepted' | 'declined'): Promise<void> {
    const docRef = doc(db, "gym_invites", inviteId);
    await updateDoc(docRef, { status });
  },

  // Trainer / Personal
  async getStudents(trainerEmail: string): Promise<UserData[]> {
    const q = query(collection(db, "users"), where("trainerEmail", "==", trainerEmail));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserData);
  },

  async prescribeWorkout(studentEmail: string, workout: Workout): Promise<void> {
    // Salva na subcoleção de treinos do aluno
    const workoutRef = collection(db, "users", studentEmail, "prescribed_workouts");
    await setDoc(doc(workoutRef), {
      ...workout,
      prescribedAt: serverTimestamp()
    });
  },

  // Admin
  async getAllUsers(): Promise<UserData[]> {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as UserData);
  },

  async toggleUserStatus(email: string, field: string, value: any): Promise<void> {
    const docRef = doc(db, "users", email);
    await updateDoc(docRef, { [field]: value });
  },

  async deleteUser(email: string): Promise<void> {
    await deleteDoc(doc(db, "users", email));
  },

  // Rádios
  async getRadios(): Promise<any[]> {
    const querySnapshot = await getDocs(collection(db, "radios"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addRadio(name: string, url: string): Promise<void> {
    const radiosRef = collection(db, "radios");
    await setDoc(doc(radiosRef), { name, url });
  },

  async deleteRadio(id: string): Promise<void> {
    await deleteDoc(doc(db, "radios", id));
  },

  // Conquistas (Achievements)
  async getAchievements(email: string): Promise<any[]> {
    const q = query(collection(db, "achievements"), where("userEmail", "==", email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async unlockAchievement(email: string, type: string): Promise<void> {
    const q = query(
      collection(db, "achievements"), 
      where("userEmail", "==", email),
      where("type", "==", type)
    );
    const existing = await getDocs(q);
    if (existing.empty) {
      await setDoc(doc(collection(db, "achievements")), {
        userEmail: email,
        type,
        unlocked_at: new Date().toISOString()
      });
    }
  }
};
