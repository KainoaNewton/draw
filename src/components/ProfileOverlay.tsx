import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { getUser, updateUser } from "@/db/auth";
import { Input } from "@/components/ui/input";
import { useProfileOverlay } from "@/contexts/ProfileOverlayContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/lib/schemas";
import { z } from "zod";
import { queryClient } from "@/main";
import { GoogleAccountConnection } from "@/components/GoogleAccountConnection";
import {
  User,
  Calendar,
  Mail,
  Shield,
  Settings,
  Edit3,
  Check,
  X,
  ChevronLeft
} from "lucide-react";
import dayjs from "dayjs";

export default function ProfileOverlay() {
  const { isProfileOpen, closeProfile } = useProfileOverlay();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (data?.error) {
    toast(data.error.message);
  }

  const user = data?.data?.user;
  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || "User";
  const userEmail = user?.email || "";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const provider = user?.app_metadata?.provider || 'email';
  const createdAt = user?.created_at;
  const lastSignIn = user?.last_sign_in_at;

  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: userName,
      email: userEmail,
    },
  });

  async function onSubmit(values: z.infer<typeof updateProfileSchema>) {
    setIsSaving(true);
    const result = await updateUser(values.name, values.email);

    if (
      result.data.user?.email === values.email &&
      result.data.user?.user_metadata.name === values.name
    ) {
      setIsSaving(false);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success("Profile updated successfully!");
    }

    if (result.error) {
      setIsSaving(false);
      toast.error("Failed to update profile", {
        description: result.error.message
      });
    }
  }

  function handleCancelEdit() {
    setIsEditing(false);
    form.reset({
      name: userName,
      email: userEmail,
    });
  }

  return (
    <Dialog open={isProfileOpen} onOpenChange={closeProfile}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChevronLeft 
              className="h-5 w-5 cursor-pointer text-text-secondary hover:text-text-primary transition-colors" 
              onClick={closeProfile}
            />
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8">
            {/* Loading skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="p-6 border border-border-subtle rounded-card bg-background-card">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-background-hover animate-pulse mb-4"></div>
                    <div className="h-6 bg-background-hover rounded w-32 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-background-hover rounded w-48 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 border border-border-subtle rounded-card bg-background-card">
                  <div className="h-6 bg-background-hover rounded w-48 mb-4 animate-pulse"></div>
                  <div className="h-16 bg-background-hover rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Overview - Left Column */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue to-purple-600 flex items-center justify-center mb-4 overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-white" />
                      )}
                    </div>

                    {/* User Info */}
                    <h2 className="text-lg font-semibold text-text-primary mb-1">{userName}</h2>
                    <p className="text-text-muted text-sm mb-4">{userEmail}</p>

                    {/* Provider Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-background-hover rounded-full text-xs text-text-secondary mb-4">
                      <Shield className="h-3 w-3" />
                      {provider === 'google' ? 'Google Account' : 'Email Account'}
                    </div>

                    {/* Account Stats */}
                    <div className="w-full space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Calendar className="h-4 w-4" />
                          <span>Joined</span>
                        </div>
                        <span className="text-text-primary">
                          {createdAt ? dayjs(createdAt).format('MMM DD, YYYY') : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Settings className="h-4 w-4" />
                          <span>Last Sign In</span>
                        </div>
                        <span className="text-text-primary">
                          {lastSignIn ? dayjs(lastSignIn).fromNow() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Profile Details - Right Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      {!isEditing ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {!isEditing ? (
                      // Display Mode
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-text-secondary">Name</label>
                          <p className="text-text-primary mt-1">{userName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-secondary">Email</label>
                          <p className="text-text-primary mt-1">{userEmail}</p>
                        </div>
                      </div>
                    ) : (
                      // Edit Mode
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your email"
                                    type="email"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>

                {/* Connected Accounts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Connected Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GoogleAccountConnection />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
