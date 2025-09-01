// Mock Firebase Auth Admin SDK for client-side compatibility
// Note: In production, these operations should be handled server-side

export interface JudgeAuthData {
  role: 'admin' | 'judge';
  sector: string | null;
  name: string;
  email: string;
  password: string;
  status: 'active' | 'inactive';
}

export interface AuthResult {
  success: boolean;
  message?: string;
  error?: string;
  uid?: string;
}

export interface JudgesListResult {
  success: boolean;
  judges: any[];
  error?: string;
}

export class FirebaseAuthAdmin {
  // Mock implementation for client-side compatibility
  static async createJudge(judgeData: JudgeAuthData): Promise<AuthResult> {
    console.log('Mock: Creating judge with data:', judgeData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success response
    return {
      success: true,
      message: `Juge ${judgeData.name} créé avec succès`,
      uid: `mock-uid-${Date.now()}`
    };
  }

  static async updateJudge(uid: string, updateData: Partial<JudgeAuthData>): Promise<AuthResult> {
    console.log('Mock: Updating judge with UID:', uid, 'Data:', updateData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: `Juge mis à jour avec succès`
    };
  }

  static async deleteJudge(uid: string, email: string, password: string): Promise<AuthResult> {
    console.log('Mock: Deleting judge with UID:', uid, 'Email:', email);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: `Juge supprimé avec succès`
    };
  }

  static async getAllJudges(): Promise<JudgesListResult> {
    console.log('Mock: Getting all judges');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      judges: []
    };
  }

  static async isEmailAvailable(email: string, excludeUid?: string): Promise<boolean> {
    console.log('Mock: Checking email availability:', email, 'Exclude UID:', excludeUid);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock: always return true for availability
    return true;
  }

  static validateJudgeData(
    data: JudgeAuthData, 
    isEditing: boolean = false, 
    excludeUid?: string
  ): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    if (!data.name?.trim()) {
      errors.name = 'Nom et prénom requis';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!isEditing && !data.password?.trim()) {
      errors.password = 'Mot de passe requis';
    } else if (data.password && data.password.length < 6) {
      errors.password = 'Mot de passe trop court (minimum 6 caractères)';
    }

    if (data.role === 'judge' && !data.sector) {
      errors.sector = 'Secteur requis pour les juges';
    }

    return errors;
  }
}

// Export types for compatibility
export type { JudgeAuthData, AuthResult, JudgesListResult };