import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/db/auth";
import { useState } from "react";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function GoogleSignInButton({ 
  className, 
  children, 
  onSuccess,
  onError 
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithGoogle();

      if (error) {
        const errorMessage = error.message || "Failed to sign in with Google";
        toast.error("Authentication Error", { 
          description: errorMessage 
        });
        onError?.(errorMessage);
        return;
      }

      // OAuth redirect will handle the success case
      // The user will be redirected to the callback URL
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Authentication Error", { 
        description: errorMessage 
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={handleGoogleSignIn}
      isLoading={isLoading}
      loadingText="Signing in..."
      disabled={isLoading}
    >
      {!isLoading && (
        <svg
          className="mr-2 h-4 w-4"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"
          ></path>
        </svg>
      )}
      {children || "Continue with Google"}
    </Button>
  );
}
