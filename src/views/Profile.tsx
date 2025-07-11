import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { getUser, updateUser } from "@/db/auth";
import { Input } from "@/components/ui/input";

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
  X
} from "lucide-react";
import dayjs from "dayjs";

export default function Profile() {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-main">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Page Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-background-hover rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-5 bg-background-hover rounded w-96 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview Skeleton */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-background-hover animate-pulse mb-4"></div>
                  <div className="h-6 bg-background-hover rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-background-hover rounded w-40 mb-4 animate-pulse"></div>

                  <div className="w-full space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="h-4 bg-background-hover rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-background-hover rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-background-hover rounded w-48 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 bg-background-hover rounded w-16 mb-2 animate-pulse"></div>
                      <div className="h-10 bg-background-hover rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-background-hover rounded w-16 mb-2 animate-pulse"></div>
                      <div className="h-10 bg-background-hover rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-6 bg-background-hover rounded w-48 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-background-hover rounded animate-pulse"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Profile Settings</h1>
          <p className="text-text-muted">Manage your account information and preferences</p>
        </div>

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

                {/* Account Stats */}
                <div className="w-full space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border-subtle">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar className="h-4 w-4" />
                      <span>Joined</span>
                    </div>
                    <span className="text-text-secondary">
                      {createdAt ? dayjs(createdAt).format('MMM YYYY') : 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border-subtle">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Shield className="h-4 w-4" />
                      <span>Provider</span>
                    </div>
                    <span className="text-text-secondary capitalize">
                      {provider === 'google' ? 'Google' : 'Email'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Settings className="h-4 w-4" />
                      <span>Last Sign In</span>
                    </div>
                    <span className="text-text-secondary">
                      {lastSignIn ? dayjs(lastSignIn).format('MMM DD') : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
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
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          isLoading={isSaving}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
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
    </div>
  );
}
