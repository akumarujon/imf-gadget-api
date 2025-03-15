import { eq } from "drizzle-orm";
import { db } from "./db";
import { gadgets } from "./schema";

import { validate as isValidUUID } from "uuid";

export async function getGadget(id) {
  const result = await db.select().from(gadgets).where(
    eq(gadgets.id, id),
  );

  return result;
}

export async function getGadgetsByStatus(
  status: "Available" | "Deployed" | "Destroyed" | "Decommissioned",
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

export async function createGadget(req, res) {
  const body = req.body;

  const result = await db.insert(gadgets).values(req.body);

  return result;
}

export async function updateGadget(
  id: string,
  name?: string,
  status?: "Available" | "Deployed" | "Destroyed" | "Decommissioned",
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
) {
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
  return { ok: true };
}

export async function deleteGadget(id: string) {
  const check = await db.select().from(gadgets).where(eq(gadgets.id, id));

  if (check.length == 0) {
    return { ok: false, message: "There is no gadget to delete" };
  }

  await db.delete(gadgets).where(eq(gadgets.id, id));

  return { ok: true, message: "Gadget is deleted successfully" };
}
