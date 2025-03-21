import { eq } from "drizzle-orm";
import { db } from "./db.ts";
import { gadgets, users } from "./schema.ts";

import { GadgetStatus } from "./types.ts";

import { validate as isValidUUID } from "uuid";
import bcryptjs from "bcryptjs";

/**
 * Retrieves a single gadget by its ID from the database
 *
 * @param {string} id - UUID of the gadget to retrieve
 * @returns {Promise<Array<Gadget>>} Array containing the found gadget or empty if not found
 *
 * @typedef {Object} Gadget
 * @property {string} id - Unique UUID identifier of the gadget
 * @property {string} name - Name of the gadget
 * @property {'Available' | 'Deployed' | 'Destroyed' | 'Decommissioned'} status - Current status of the gadget
 *
 * @example
 * // Usage
 * const gadget = await getGadget('123e4567-e89b-12d3-a456-426614174000');
 *
 * @example
 * // Return value when gadget is found
 * [
 *   {
 *     id: "123e4567-e89b-12d3-a456-426614174000",
 *     name: "Example Gadget",
 *     status: "Available"
 *   }
 * ]
 *
 * @example
 * // Return value when gadget is not found
 * []
 */
export async function getGadget(id) {
  const result = await db.select().from(gadgets).where(
    eq(gadgets.id, id),
  );

  return result[0];
}

/**
 * Retrieves all gadgets with a specific status from the database
 *
 * @param {GadgetStatus} status - Status to filter by
 * @returns {Promise<Array<Gadget>>} Array of gadgets matching the status
 *
 * @typedef {'Available' | 'Deployed' | 'Destroyed' | 'Decommissioned'} GadgetStatus
 *
 * @typedef {Object} Gadget
 * @property {string} id - Unique UUID identifier of the gadget
 * @property {string} name - Name of the gadget
 * @property {GadgetStatus} status - Current status of the gadget
 *
 * @example
 * // Usage
 * const deployedGadgets = await getGadgetsByStatus('Deployed');
 *
 * @example
 * // Return value with matching gadgets
 * [
 *   {
 *     id: "123e4567-e89b-12d3-a456-426614174000",
 *     name: "Gadget 1",
 *     status: "Deployed"
 *   },
 *   {
 *     id: "987fcdeb-51d3-a456-426614174000-89b",
 *     name: "Gadget 2",
 *     status: "Deployed"
 *   }
 * ]
 *
 * @example
 * // Return value when no gadgets match the status
 * []
 */
export async function getGadgetsByStatus(
  status: GadgetStatus,
) {
  const result = await db.select().from(gadgets).where(
    eq(gadgets.status, status),
  );

  return result;
}

/**
 * Retrieves all gadgets from the database
 *
 * @returns {Promise<Array<Gadget>>} Array of all gadgets
 *
 * @typedef {Object} Gadget
 * @property {string} id - Unique UUID identifier of the gadget
 * @property {string} name - Name of the gadget
 * @property {'Available' | 'Deployed' | 'Destroyed' | 'Decommissioned'} status - Current status of the gadget
 *
 * @example
 * // Usage
 * const allGadgets = await getGadgets();
 *
 * @example
 * // Return value with gadgets
 * [
 *   {
 *     id: "123e4567-e89b-12d3-a456-426614174000",
 *     name: "Gadget 1",
 *     status: "Available"
 *   },
 *   {
 *     id: "987fcdeb-51d3-a456-426614174000-89b",
 *     name: "Gadget 2",
 *     status: "Deployed"
 *   },
 *   {
 *     id: "456abc89-12d3-a456-426614174000-ef0",
 *     name: "Gadget 3",
 *     status: "Decommissioned"
 *   }
 * ]
 *
 * @example
 * // Return value when database is empty
 * []
 */
export async function getGadgets() {
  const result = await db.select().from(gadgets);

  return result;
}

/**
 * Creates a new gadget in the database
 *
 * @param {string} name - Name of the gadget to create
 * @param {GadgetStatus} status - Initial status of the gadget
 * @returns {Promise<import('drizzle-orm').PostgresQueryResult>} Result of the insert operation
 *
 * @typedef {'Available' | 'Deployed' | 'Destroyed' | 'Decommissioned'} GadgetStatus
 *
 * @description
 * Creates a new gadget with the specified name and status. The ID is automatically
 * generated as a UUID by the database.
 *
 * @example
 * // Usage
 * const result = await createGadget("New Gadget", "Available");
 *
 * @example
 * // Input validation
 * name.length <= 255 // Name must be 255 characters or less
 * status must be one of: "Available", "Deployed", "Destroyed", "Decommissioned"
 *
 * @throws {Error} Will throw an error if:
 * - Name exceeds 255 characters
 * - Status is not one of the valid GadgetStatus values
 * - Database constraints are violated
 * - Database connection fails
 */
export async function createGadget(name: string, status: GadgetStatus) {
  const result = await db.insert(gadgets).values({ name, status });

  return result;
}

/**
 * Updates a gadget's name or status in the database
 *
 * @param {string} id - UUID of the gadget to update
 * @param {string} [name] - New name for the gadget
 * @param {GadgetStatus} [status] - New status for the gadget
 * @returns {Promise<{ok: boolean}>} Object indicating success of the operation
 *
 * @typedef {'Available' | 'Deployed' | 'Destroyed' | 'Decommissioned'} GadgetStatus
 *
 * @description
 * Updates either the name or status of an existing gadget. The function accepts
 * both parameters but will only update one field per call - name takes precedence
 * over status if both are provided.
 *
 * @example
 * // Update name
 * const result = await updateGadget("123e4567-e89b-12d3-a456-426614174000", "New Name");
 *
 * @example
 * // Update status
 * const result = await updateGadget("123e4567-e89b-12d3-a456-426614174000", undefined, "Deployed");
 *
 * @example
 * // Successful return value
 * {
 *   ok: true
 * }
 *
 * @throws {Error} Will throw an error if:
 * - Gadget with specified ID doesn't exist
 * - Name exceeds 255 characters
 * - Status is not one of the valid GadgetStatus values
 * - Database connection fails
 *
 * @note
 * - At least one of name or status must be provided
 * - If both name and status are provided, only name will be updated
 * - The function doesn't return the updated gadget data
 */
export async function updateGadget(
  id: string,
  name?: string,
  status?: GadgetStatus,
) {
  const check = await db.select().from(gadgets).where(eq(gadgets.id, id));

  if (check.length == 0) {
    return { ok: false, message: "No gadget was found." };
  }

  if (name) {
    await db.update(gadgets).set({ name }).where(eq(gadgets.id, id));
  } else {
    await db.update(gadgets).set({ status }).where(eq(gadgets.id, id));
  }

  return { ok: true };
}

/**
 * Decommissions a gadget by changing its status
 *
 * @param {string} id - UUID of the gadget to decommission
 * @returns {Promise<{ok: boolean, message: string}>} Result object containing operation status and message
 *
 * @description
 * Changes a gadget's status to "Decommissioned" after performing several validation checks:
 * 1. Validates UUID format
 * 2. Checks if gadget exists
 * 3. Verifies gadget isn't already decommissioned
 *
 * @example
 * // Usage
 * const result = await decommissionGadget("123e4567-e89b-12d3-a456-426614174000");
 *
 * @example
 * // Successful response
 * {
 *   ok: true,
 *   message: "Gadget was Decommissioned successfully"
 * }
 *
 * @example
 * // Error responses
 * {
 *   ok: false,
 *   message: "Wrong UUID was provided"
 * }
 * // or
 * {
 *   ok: false,
 *   message: "No gadget with this UUID was found"
 * }
 * // or
 * {
 *   ok: false,
 *   message: "Gadget was already Decommissioned"
 * }
 *
 * @throws {Error} May throw database errors if:
 * - Database connection fails
 * - Update operation fails
 *
 * @note
 * - This is a soft-delete operation
 * - The operation cannot be undone through normal means
 * - Decommissioned gadgets remain in the database
 */
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

/**
 * Marks a gadget as destroyed in the database
 *
 * @param {string} id - UUID of the gadget to destroy
 * @returns {Promise<{ok: boolean, message: string}>} Result object containing operation status and message
 *
 * @description
 * Changes a gadget's status to "Destroyed" after performing several validation checks:
 * 1. Validates UUID format
 * 2. Checks if gadget exists
 * 3. Verifies gadget isn't already destroyed
 *
 * @example
 * // Usage
 * const result = await destroyGadget("123e4567-e89b-12d3-a456-426614174000");
 *
 * @example
 * // Successful response
 * {
 *   ok: true,
 *   message: "Gadget is destroyed successfully"
 * }
 *
 * @example
 * // Error responses
 * {
 *   ok: false,
 *   message: "Wrong UUID was provided"
 * }
 * // or
 * {
 *   ok: false,
 *   message: "There is no gadget to destroy"
 * }
 * // or
 * {
 *   ok: false,
 *   message: "Gadget was already destroyed"
 * }
 *
 * @throws {Error} May throw database errors if:
 * - Database connection fails
 * - Update operation fails
 *
 * @note
 * - This is an irreversible operation
 * - Destroyed gadgets remain in the database with "Destroyed" status
 * - This is a logical destruction, not a physical deletion from the database
 * - Consider implementing additional security measures before allowing destruction
 *
 * @security
 * - Should require additional confirmation in production
 * - Consider implementing role-based access control
 * - Should log destruction events for audit purposes
 */
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

/**
 * Creates a new user in the database
 *
 * @param {string} username - Username for the new user
 * @param {string} password - Hashed password for the new user
 * @returns {Promise<{ok: boolean, message: string}>} Result object containing operation status and message
 *
 * @description
 * Creates a new user after checking for username uniqueness.
 * Expects the password to be already hashed before being passed to this function.
 *
 * @example
 * // Usage
 * const hashedPassword = await bcrypt.hash(password, 10);
 * const result = await createUser("newuser", hashedPassword);
 *
 * @example
 * // Successful response
 * {
 *   ok: true,
 *   message: "User is created successfully"
 * }
 *
 * @example
 * // Error response - Username taken
 * {
 *   ok: false,
 *   message: "This username is not empty"
 * }
 *
 * @throws {Error} May throw database errors if:
 * - Database connection fails
 * - Insert operation fails
 * - Unique constraint violation occurs
 *
 * @note
 * - Username must be unique
 * - Username has a maximum length of 255 characters
 * - Password should be hashed before being passed to this function
 * - UUID is automatically generated for the user
 *
 * @security
 * - Never pass plain text passwords to this function
 * - Ensure password hashing is done before calling this function
 * - Consider implementing password strength requirements
 * - Consider adding email verification
 * - Consider adding rate limiting for user creation
 *
 * @todo
 * - Improve error message for username conflict
 * - Add input validation for username format
 * - Add username length validation
 */
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

/**
 * Authenticates a user by verifying their username and password
 *
 * @param {string} username - Username to authenticate
 * @param {string} password - Plain text password to verify
 * @returns {Promise<{ok: boolean, message: string}>} Result object containing authentication status and message
 *
 * @description
 * Verifies user credentials through a two-step process:
 * 1. Checks if username exists in database
 * 2. Verifies password using bcrypt comparison
 *
 * @example
 * // Usage
 * const result = await loginUser("existinguser", "userpassword123");
 *
 * @example
 * // Successful response
 * {
 *   ok: true,
 *   message: "The user logged in."
 * }
 *
 * @example
 * // Error responses
 * {
 *   ok: false,
 *   message: "This user doesn't exist"
 * }
 * // or
 * {
 *   ok: false,
 *   message: "The password is wrong"
 * }
 *
 * @throws {Error} May throw errors if:
 * - Database connection fails
 * - bcrypt comparison fails
 *
 * @security
 * - Uses bcrypt for password comparison
 * - Doesn't reveal whether username or password was incorrect in error messages
 * - Consider implementing login attempt rate limiting
 * - Consider implementing account lockout after failed attempts
 * - Consider implementing 2FA
 *
 * @note
 * - Password comparison is time-safe through bcrypt
 * - Error messages are intentionally vague for security
 * - Success response doesn't include any user data
 */
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
