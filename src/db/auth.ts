import { supabase } from "./supabase";

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  return { data, error };
}

export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name,
      },
    },
  });
  return { data, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  return { error };
}

export async function getLocalUser() {
  const { data, error } = await supabase.auth.getSession();

  return { data, error };
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();

  return { data, error };
}

export async function updateUser(name: string, email: string) {
  const { data, error } = await supabase.auth.updateUser({
    email: email,
    data: {
      name: name,
    },
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/pages`,
    },
  });
  return { data, error };
}

export async function linkGoogleAccount() {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/profile`,
    },
  });
  return { data, error };
}

export async function unlinkGoogleAccount() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: userError || new Error('No user found') };
    }

    // Find the Google identity to unlink
    const googleIdentity = user.identities?.find(identity => identity.provider === 'google');

    if (!googleIdentity) {
      return { data: null, error: new Error('No Google identity found to disconnect') };
    }

    const { data, error } = await supabase.auth.unlinkIdentity(googleIdentity);
    return { data, error };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Failed to unlink Google account') };
  }
}
