import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  role: string = 'client',
  phoneNumber?: string
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role,
        phoneNumber: phoneNumber || null,
        status: 'active',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || email.split('@')[0],
          phoneNumber: phoneNumber || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to getOrCreateUser:', error);
    throw new Error('Database error during user registration', { cause: error });
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Failed to getUserByEmail:', error);
    throw new Error('Database error querying user by email', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Failed to getUserByUid:', error);
    throw new Error('Database error querying user by UID', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Failed to getAllUsers:', error);
    throw new Error('Database error querying all users', { cause: error });
  }
}

export async function registerOrInviteClient(
  email: string,
  displayName: string,
  phoneNumber?: string
) {
  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      return existing;
    }

    // Generate a temporary invitation UID if the client hasn't logged in with Google yet
    const generatedUid = `invite_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const result = await db
      .insert(users)
      .values({
        uid: generatedUid,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        role: 'client',
        phoneNumber: phoneNumber || null,
        status: 'invited',
        inviteSentAt: new Date(),
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to registerOrInviteClient:', error);
    throw new Error('Database error registering client invitation', { cause: error });
  }
}
