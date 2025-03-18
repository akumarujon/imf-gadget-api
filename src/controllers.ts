import { eq } from "drizzle-orm";
import { db } from "./db.ts";
import { gadgets, users } from "./schema.ts";

import { GadgetStatus } from "./types.ts";

import { validate as isValidUUID } from "uuid";
import bcryptjs from "bcryptjs";

export async function getGadget(id) {
  const result = await db.select().from(gadgets).where(
    eq(gadgets.id, id),
  );

  return result;
}

export async function getGadgetsByStatus(
  status: GadgetStatus,
) {
  const result = await db.select().from(gadgets).where(
    eq(gadgets.status, status),
  );

  return result;
}

export async function getGadgets() {
  const result = await db.select().from(gadgets);

  return result;
}

export async function createGadget(name: string, status: GadgetStatus) {
  const result = await db.insert(gadgets).values({ name, status });

  return result;
}

export async function updateGadget(
  id: string,
  name?: string,
  status?: GadgetStatus,
) {
  if (name) {
    await db.update(gadgets).set({ name }).where(eq(gadgets.id, id));
  } else {
    await db.update(gadgets).set({ status }).where(eq(gadgets.id, id));
  }

  return { ok: true };
}

export async function decommissionGadget(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  if (!isValidUUID(id)) {
    return { ok: false, message: "Wrong UUID was provided" };
  }

  const check = await db.select().from(gadgets).where(eq(gadgets.id, id));

  if (check.length == 0) {
    return { ok: false, message: "No gadget with this UUID was found" };
  }

  if (check[0].status == "Decommissioned") {
    return { ok: false, message: "Gadget was already Decommissioned" };
  }

  await db.update(gadgets).set({ status: "Decommissioned" }).where(
    eq(gadgets.id, id),
  );
  return { ok: true, message: "Gadget was Decommissioned successfully" };
}

export async function destroyGadget(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  if (!isValidUUID(id)) {
    return { ok: false, message: "Wrong UUID was provided" };
  }

  const check = await db.select().from(gadgets).where(eq(gadgets.id, id));

  if (check.length == 0) {
    return { ok: false, message: "There is no gadget to destroy" };
  }

  if (check[0].status == "Destroyed") {
    return { ok: false, message: "Gadget was already destroyed" };
  }

  await db.update(gadgets).set({ "status": "Destroyed" }).where(
    eq(gadgets.id, id),
  );

  return { ok: true, message: "Gadget is destroyed successfully" };
}

export async function createUser(
  username: string,
  password: string,
): Promise<{ ok: boolean; message: string }> {
  const check = await db.select().from(users).where(
    eq(users.username, username),
  );

  if (check.length != 0) {
    return { ok: false, message: "This username is not empty" };
  }

  await db.insert(users).values({ username, password });

  return { ok: true, message: "User is created successfully" };
}

export async function loginUser(
  username: string,
  password: string,
): Promise<{ ok: boolean; message: string }> {
  const check = await db.select().from(users).where(
    eq(users.username, username),
  );

  if (check.length == 0) {
    return { ok: false, message: "This user doesn't exist" };
  }

  const passwordCheck = await bcryptjs.compare(password, check[0].password);

  if (!passwordCheck) return { ok: false, message: "The password is wrong" };

  return { ok: true, message: "The user logged in." };
}
