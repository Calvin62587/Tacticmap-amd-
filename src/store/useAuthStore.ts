import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    birthdate: string;
    country: string;
    gender: 'female' | 'male' | 'other' | 'prefer_not';
    createdAt: number;
}

export interface ClinicalProfile {
    // Physical
    weight: string;     // kg
    height: string;     // cm
    bloodType: string;

    // Antecedents
    priorCancerDx: boolean;
    familyHistory: boolean;
    lastExamDate: string;

    // Lifestyle
    physicalActivity: 'sedentary' | 'light' | 'moderate' | 'active';
    breastfeeding: boolean;
    hormonalContraceptives: boolean;

    // Metadata
    isComplete: boolean;
}

export interface Consents {
    termsOfUse: boolean;
    healthDataGdpr: boolean;
    samdDisclaimer: boolean;
    privacyPolicy: boolean;
}

export type OnboardingStep = 'login' | 'register' | 'consent' | 'clinical' | 'done';

// ─── Store interface ──────────────────────────────────────────────────────────

interface AuthStore {
    user: User | null;
    clinicalProfile: ClinicalProfile | null;
    consents: Consents;
    onboardingStep: OnboardingStep;

    // Actions
    register: (user: Omit<User, 'id' | 'createdAt'>) => void;
    login: (email: string, password: string) => boolean;
    acceptConsents: (consents: Consents) => void;
    saveClinicalProfile: (profile: ClinicalProfile) => void;
    skipClinicalProfile: () => void;
    logout: () => void;
    goToRegister: () => void;
    goToLogin: () => void;
}

const DEFAULT_CONSENTS: Consents = {
    termsOfUse: false,
    healthDataGdpr: false,
    samdDisclaimer: false,
    privacyPolicy: false,
};

// ─── Auth store (persisted) ───────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            clinicalProfile: null,
            consents: { ...DEFAULT_CONSENTS },
            onboardingStep: 'login',

            register: (userData) => {
                const user: User = {
                    ...userData,
                    id: `u_${Date.now()}`,
                    createdAt: Date.now(),
                };
                set({ user, onboardingStep: 'consent' });
            },

            login: (email, _password) => {
                const { user } = get();
                // In a real app this would hit an API. For now, match stored email.
                if (user && user.email.toLowerCase() === email.toLowerCase()) {
                    set({
                        onboardingStep: user
                            ? get().onboardingStep === 'done' || get().clinicalProfile !== null
                                ? 'done'
                                : 'clinical'
                            : 'consent',
                    });
                    return true;
                }
                return false;
            },

            acceptConsents: (consents) => {
                set({ consents, onboardingStep: 'clinical' });
            },

            saveClinicalProfile: (profile) => {
                set({ clinicalProfile: { ...profile, isComplete: true }, onboardingStep: 'done' });
            },

            skipClinicalProfile: () => {
                set({
                    clinicalProfile: {
                        weight: '', height: '', bloodType: '',
                        priorCancerDx: false, familyHistory: false, lastExamDate: '',
                        physicalActivity: 'sedentary', breastfeeding: false,
                        hormonalContraceptives: false, isComplete: false,
                    },
                    onboardingStep: 'done',
                });
            },

            logout: () => {
                set({
                    onboardingStep: 'login',
                    consents: { ...DEFAULT_CONSENTS },
                });
            },

            goToRegister: () => set({ onboardingStep: 'register' }),
            goToLogin: () => set({ onboardingStep: 'login' }),
        }),
        {
            name: 'tacticmap-auth',
            partialState: (state) => ({
                user: state.user,
                clinicalProfile: state.clinicalProfile,
                consents: state.consents,
                onboardingStep: state.onboardingStep,
            }),
        } as any,
    )
);
