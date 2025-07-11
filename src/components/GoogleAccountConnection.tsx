import { useState } from 'react';
import { useGoogleConnection } from '@/hooks/useGoogleConnection';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  User,
  MoreHorizontal
} from 'lucide-react';

interface GoogleAccountConnectionProps {
  className?: string;
}

export function GoogleAccountConnection({ className }: GoogleAccountConnectionProps) {
  const {
    isConnected,
    googleAccount,
    isLoading,
    error,
    connect,
    disconnect,
    switchAccount
  } = useGoogleConnection();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleConnect = async () => {
    setActionLoading('connect');
    await connect();
    setActionLoading(null);
  };

  const handleDisconnect = async () => {
    setActionLoading('disconnect');
    await disconnect();
    setActionLoading(null);
  };

  const handleSwitchAccount = async () => {
    setActionLoading('switch');
    await switchAccount();
    setActionLoading(null);
  };

  if (isLoading && !actionLoading) {
    return (
      <div className={`flex items-center gap-3 px-3 py-2 ${className}`}>
        <div className="w-4 h-4 rounded-full bg-background-hover animate-pulse flex-shrink-0" />
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="h-3 bg-background-hover rounded animate-pulse w-24" />
          <div className="h-2 bg-background-hover rounded animate-pulse w-32" />
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className={`p-4 rounded-lg border border-red-500/20 bg-red-500/10 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500/20">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-red-400">Connection Error</span>
            <span className="text-sm text-red-300">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`flex items-center justify-between gap-4 p-4 rounded-lg border border-border-subtle bg-background-hover/30 ${className}`}>
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-background-hover">
            <svg
              className="w-6 h-6 text-text-muted"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-text-primary">Google</span>
            <span className="text-sm text-text-muted">Connect your Google account for easier sign-in</span>
          </div>
        </div>
        <Button
          variant="default"
          onClick={handleConnect}
          disabled={actionLoading === 'connect'}
          className="px-6 py-2"
        >
          {actionLoading === 'connect' ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <LinkIcon className="h-4 w-4 mr-2" />
          )}
          Connect
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between gap-4 p-4 rounded-lg border border-green-500/20 bg-green-500/10 ${className}`}>
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-green-600 relative">
          {googleAccount?.picture ? (
            <img
              src={googleAccount.picture}
              alt={googleAccount.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-white" />
          )}
          {/* Connected indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-background-main flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-green-800" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary truncate">
              Google
            </span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              Connected
            </span>
          </div>
          <span className="text-sm text-text-muted truncate">
            {googleAccount?.name} • {googleAccount?.email}
          </span>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-text-muted hover:text-text-primary"
            disabled={!!actionLoading}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={handleSwitchAccount}
            disabled={actionLoading === 'switch'}
            className="text-sm"
          >
            {actionLoading === 'switch' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Switch Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            disabled={actionLoading === 'disconnect'}
            className="text-sm text-red-400 focus:text-red-300"
          >
            {actionLoading === 'disconnect' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4 mr-2" />
            )}
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default GoogleAccountConnection;
