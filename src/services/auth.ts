
import {supabase} from './supabase';

let sessionPromise: Promise<void> | null = null;

export function initializeGuestSession(): Promise<void> {
    if (!sessionPromise) {
        sessionPromise = createGuestSession();
    }

    return sessionPromise;
}

async function createGuestSession(): Promise<void> {

    // Check if a session already exists
    const {data:{session}, error} =
        await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    // Create an anonymous account if necessary
    if (!session) {
        const {error: signInError} =
            await supabase.auth.signInAnonymously();

        if (signInError) {
            throw signInError;
        }
    }

    
}
