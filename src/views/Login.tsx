import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { HiddenInput, Input } from "@/components/ui/input";
import { GoogleSignInButton } from "@/components/ui/google-sign-in-button";
import { loginSchema } from "@/lib/schemas";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { login } from "@/db/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    const data = await login(values.email, values.password);

    if (data.data.session) {
      setIsLoading(false);
      navigate({ to: "/pages" });
      toast("Signed In!");
    }

    if (data.error) {
      setIsLoading(false);
      toast("Authentication Error", { description: data.error.message });
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-background-main p-6">
      <Card className="w-full max-w-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="text-center">
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="mac@justapps.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        {/* <Input id="password" type="password" {...field} /> */}
                        <HiddenInput id="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                type="submit"
                isLoading={isLoading}
                loadingText="Signing In"
              >
                Login
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border-subtle" />
                </div>
                <div className="relative flex justify-center text-ui uppercase">
                  <span className="bg-background-card px-2 text-text-muted">
                    Or
                  </span>
                </div>
              </div>

              <GoogleSignInButton
                className="w-full"
                onSuccess={() => {
                  toast("Signing in with Google...");
                }}
                onError={(error) => {
                  console.error("Google sign-in error:", error);
                }}
              />

              <div className="flex space-x-2 text-body">
                <span className="text-text-secondary">Don't have an account?</span>
                <Link className="font-bold underline text-accent-blue hover:text-[#3a7bc8] transition-colors" to="/signup">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
