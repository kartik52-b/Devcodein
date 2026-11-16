import { supabase } from '../lib/supabase';

/**
 * The `profiles` table in Supabase Postgres.
 *
 * RLS policies (see supabase/migrations) allow an authenticated user to read,
 * insert and update only the row whose `id` equals `auth.uid()`. The browser
 * therefore never needs to send a user id it can forge — it still does, but a
 * mismatched id is rejected by the database itself.
 */
const TABLE = 'profiles';
const COLUMNS = 'id, full_name, email, avatar_url, created_at, updated_at';

const displayNameFallback = (user) =>
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  (user?.email ? user.email.split('@')[0] : 'Learner');

export const profileService = {
  /** Reads the signed-in user's profile row (null when it does not exist). */
  async fetch(userId) {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
      .from(TABLE)
      .select(COLUMNS)
      .eq('id', userId)
      .maybeSingle();

    // PGRST116 = no rows returned for maybeSingle on older PostgREST versions.
    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  },

  /**
   * Creates the profile row if the auth trigger has not done it yet (for
   * example on projects where the trigger was added after some users signed
   * up). Uses upsert on the primary key, so it can never duplicate a profile.
   */
  async ensure(user) {
    if (!supabase || !user?.id) return null;
    const payload = {
      id: user.id,
      email: String(user.email || '').toLowerCase(),
      full_name: String(displayNameFallback(user)).slice(0, 80),
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    };

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(payload, { onConflict: 'id' })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return data;
  },

  /** Updates only the signed-in user's own profile. */
  async update(userId, { fullName, avatarUrl }) {
    if (!supabase) throw new Error('Supabase is not configured.');
    if (!userId) throw new Error('You must be signed in to update your profile.');

    const patch = {};
    if (typeof fullName === 'string') patch.full_name = fullName.trim().slice(0, 80);
    if (typeof avatarUrl === 'string') patch.avatar_url = avatarUrl.trim() || null;

    const { data, error } = await supabase
      .from(TABLE)
      .update(patch)
      .eq('id', userId)
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return data;
  }
};
