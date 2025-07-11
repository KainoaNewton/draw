import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/db/supabase';
import { signInWithGoogle, linkGoogleAccount, unlinkGoogleAccount } from '@/db/auth';
import { toast } from 'sonner';

interface GoogleAccount {
  name: string;
  email: string;
  picture?: string;
}

interface UseGoogleConnectionReturn {
  isConnected: boolean;
  googleAccount: GoogleAccount | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchAccount: () => Promise<void>;
}

export function useGoogleConnection(): UseGoogleConnectionReturn {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query to get current user and check if they're connected via Google
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'google-connection'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Determine if user is connected via Google and extract Google account info
  const isConnected = user?.app_metadata?.provider === 'google';
  const googleAccount: GoogleAccount | null = isConnected ? {
    name: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
    email: user?.email || '',
    picture: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || undefined,
  } : null;

  const connect = async () => {
    try {
      setError(null);

      // If user is already signed in with email/password, we need to link the Google account
      if (user && user.app_metadata?.provider !== 'google') {
        // For linking accounts, we need to use the linkIdentity method
        const { error } = await linkGoogleAccount();

        if (error) {
          throw new Error(error.message);
        }

        toast.success('Redirecting to Google for account linking...');
      } else {
        // If no user is signed in, use regular OAuth sign in
        const { error } = await signInWithGoogle();

        if (error) {
          throw new Error(error.message);
        }

        toast.success('Redirecting to Google...');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Google account';
      setError(errorMessage);
      toast.error('Connection Failed', {
        description: errorMessage
      });
    }
  };

  const disconnect = async () => {
    try {
      setError(null);

      if (!user || !isConnected) {
        throw new Error('No Google account connected');
      }

      // Use the helper function to unlink Google account
      const { error } = await unlinkGoogleAccount();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh user data
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await queryClient.invalidateQueries({ queryKey: ['user', 'google-connection'] });

      toast.success('Google account disconnected successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect Google account';
      setError(errorMessage);
      toast.error('Disconnection Failed', {
        description: errorMessage
      });
    }
  };

  const switchAccount = async () => {
    try {
      setError(null);
      
      // First disconnect current account, then reconnect
      if (isConnected) {
        await disconnect();
        // Small delay to ensure disconnection is processed
        setTimeout(() => {
          connect();
        }, 1000);
      } else {
        await connect();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch Google account';
      setError(errorMessage);
      toast.error('Switch Account Failed', { 
        description: errorMessage 
      });
    }
  };

  // Listen for auth state changes to update connection status
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Invalidate queries to refresh connection status
          await queryClient.invalidateQueries({ queryKey: ['user', 'google-connection'] });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    isConnected,
    googleAccount,
    isLoading,
    error,
    connect,
    disconnect,
    switchAccount,
  };
}
