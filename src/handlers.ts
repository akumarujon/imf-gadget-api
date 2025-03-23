import "dotenv/config";
import {
  createGadget,
  createUser,
  decommissionGadget,
  destroyGadget,
  getGadget,
  getGadgets,
  getGadgetsByStatus,
  loginUser,
  updateGadget,
} from "./controllers.ts";
import { GadgetStatus, JSONResponse } from "./types.ts";
import { capitalize, isCapitalized } from "./utils.ts";
import bcryptjs from "bcryptjs";
import { StatusCodes } from "http-status-codes";

import jwt from "jsonwebtoken";

import { SECRET_KEY } from "./env.ts";

// app.get("/")
export function defaultRoute(req, res) {
  res.status(302).redirect("/docs");
}

// app.post("/register")
/**
 * Registers a new user with hashed password in the database
 *
 * @param {import('express').Request} req - Express request object containing username and password in body
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {JSONResponse} Returns a 400 status if:
 *  - Username or password is missing in request body
 *  - Username already exists
 *  - Other database constraints are violated
 *
 * @description
 * The password is hashed using bcrypt with a salt round of 10 before storage.
 *
 * @example
 * // Successful response (201 Created)
 * {
 *   success: true,
 *   message: "User successfully registered",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 *
 * @example
 * // Error response (400 Bad Request)
 * {
 *   success: false,
 *   message: "Error message",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 */
export async function registerUser(req, res) {
  if (!req.body.username && !req.body.password) {
    res.status(StatusCodes.BAD_REQUEST).json(
      {
        success: false,
        message: "Username or Password is missing in body.",
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
    return;
  }

  const hashedPassword = await bcryptjs.hash(req.body.password, 10);
  const result = await createUser(req.body.username, hashedPassword);

  if (!result.ok) {
    res.status(StatusCodes.BAD_REQUEST).json(
      {
        success: false,
        message: result.message,
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
    return;
  }

  res.status(StatusCodes.CREATED).json(
    {
      success: true,
      message: result.message,
      data: [],
      meta: {
        time: new Date().toLocaleString(),
        requestID: res.locals.requestID,
      },
    } satisfies JSONResponse,
  );
}

// app.post("/login")
/**
 * Verifies user login credentials and generates a JWT token upon successful authentication
 *
 * @param {import('express').Request} req - Express request object containing username and password in body
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {JSONResponse} Returns a 400 status if:
 *  - Username or password is missing in request body
 *  - Login credentials are invalid
 *
 * @example
 * // Successful response (201 Created)
 * {
 *   success: true,
 *   message: "Login successful",
 *   data: { token: "jwt-token-string" },
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 *
 * @example
 * // Error response (400 Bad Request)
 * {
 *   success: false,
 *   message: "Error message",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 */
export async function verifyLoginUser(req, res) {
  if (!req.body.username && !req.body.password) {
    res.status(StatusCodes.BAD_REQUEST).json(
      {
        success: false,
        message: "Username or Password is missing in body.",
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
    return;
  }

  const result = await loginUser(req.body.username, req.body.password);

  if (!result.ok) {
    res.status(StatusCodes.BAD_REQUEST).json(
      {
        success: false,
        message: result.message,
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
    return;
  }

  const token = jwt.sign({ username: req.body.username }, SECRET_KEY!, {
    expiresIn: 60 * 60 * 24 * 7,
  });

  res.status(StatusCodes.OK).json(
    {
      success: true,
      message: result.message,
      data: { token },
      meta: {
        time: new Date().toLocaleString(),
        requestID: res.locals.requestID,
      },
    } satisfies JSONResponse,
  );
}

// app.get(["/gadgets", "/gadgets/:id"])
/**
 * Handles GET requests for gadgets with optional filtering by ID or status
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @description
 * Supports three query patterns:
 * 1. /gadgets/:id - Returns a specific gadget by ID
 * 2. /gadgets?status={status} - Returns gadgets filtered by status
 * 3. /gadgets - Returns all gadgets
 *
 * Valid status values are:
 * - "Available"
 * - "Deployed"
 * - "Destroyed"
 * - "Decommissioned"
 *
 * @throws {JSONResponse} Returns a 400 status if:
 *  - Status query parameter is not capitalized
 *  - Status value is not one of the valid statuses
 *
 * @example
 * // Successful response (200 OK)
 * {
 *   success: true,
 *   message: "",
 *   data: [
 *     {
 *       id: "uuid-string",
 *       name: "Gadget Name",
 *       status: "Available"
 *     }
 *   ],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 *
 * @example
 * // Error response (400 Bad Request)
 * {
 *   success: false,
 *   message: "Status must be capitalized",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 */
export async function getGadgetsRoute(req, res) {
  const id = req.params.id;
  if (id) {
    res.send(await getGadget(id));
  }

  let query_status = req.query.status;

  if (query_status) {
    query_status = query_status.toString();

    console.log(query_status);

    if (!isCapitalized(query_status)) {
      res.status(StatusCodes.BAD_REQUEST).json(
        {
          success: false,
          message: "Status must be capitalized",
          data: [],
          meta: {
            time: new Date().toLocaleString(),
            requestID: res.locals.requestID,
          },
        } satisfies JSONResponse,
      );
    }

    const validStatuses = new Set([
      "Available",
      "Deployed",
      "Destroyed",
      "Decommissioned",
    ]);

    if (!validStatuses.has(query_status)) {
      res.status(StatusCodes.BAD_REQUEST).json(
        {
          success: false,
          message: "Given status does not exist",
          data: [],
          meta: {
            time: new Date().toLocaleString(),
            requestID: res.locals.requestID,
          },
        } satisfies JSONResponse,
      );
    }

    const result = await getGadgetsByStatus(query_status as GadgetStatus);

    res.status(StatusCodes.OK).json(
      {
        success: true,
        message: "",
        data: result,
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
  }
  res.json(await getGadgets());
}

// app.post("/gadgets")
/**
 * Creates a new gadget with the specified name and status
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @description
 * Creates a new gadget entry in the database. The status string is automatically
 * capitalized before storage. Requires both name and status in the request body.
 *
 * @param {Object} req.body
 * @param {string} req.body.name - Name of the gadget
 * @param {string} req.body.status - Status of the gadget (will be capitalized)
 * Must be one of: "Available", "Deployed", "Destroyed", "Decommissioned"
 *
 * @throws {JSONResponse} Returns a 400 status if:
 *  - Name or status is missing in request body
 *
 * @example
 * // Request body
 * {
 *   "name": "New Gadget",
 *   "status": "Available"
 * }
 *
 * @example
 * // Successful response (200 OK)
 * {
 *   success: true,
 *   message: "Gadget is created successfully",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 *
 * @example
 * // Error response (400 Bad Request)
 * {
 *   success: false,
 *   message: "Body is missing status or name parameter.",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 */
export async function createGadgetRoute(req, res) {
  if (!req.body.name || !req.body.status) {
    res.status(StatusCodes.BAD_REQUEST).json(
      {
        success: false,
        message: "Body is missing status or name parameter.",
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
  }

  await createGadget(
    req.body.name,
    capitalize(req.body.status) as GadgetStatus,
  );

  res.status(StatusCodes.OK).json(
    {
      success: true,
      message: "Gadget is created successfully",
      data: [],
      meta: {
        time: new Date().toLocaleString(),
        requestID: res.locals.requestID,
      },
    } satisfies JSONResponse,
  );
}

// app.patch("/gadgets/:id")
/**
 * Updates an existing gadget's name or status
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @description
 * Updates a gadget identified either by URL parameter ID or query parameter ID.
 * Requires at least one of name or status in the request body.
 * Status strings are automatically capitalized before update.
 *
 * @param {string} [req.params.id] - Gadget ID from URL parameter
 *
 * @param {string} [req.query.id] - Gadget ID from query parameter
 *
 * @param {string} [req.body.name] - New name for the gadget
 * @param {string} [req.body.status] - New status for the gadget
 * Must be one of: "Available", "Deployed", "Destroyed", "Decommissioned"
 *
 * @throws {JSONResponse} Returns:
 *  - 400 Bad Request: If both name and status are missing in request body
 *  - 422 Unprocessable Entity: If update operation fails
 *
 * @example
 * // Request URL examples
 * PATCH /gadgets/123e4567-e89b-12d3-a456-426614174000
 * PATCH /gadgets?id=123e4567-e89b-12d3-a456-426614174000
 *
 * @example
 * // Request body example
 * {
 *   "name": "Updated Gadget Name",
 *   "status": "Deployed"
 * }
 *
 * @example
 * // Successful response (200 OK)
 * {
 *   success: true,
 *   message: "Gadget was updated successfully.",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 *
 * @example
 * // Error response (422 Unprocessable Entity)
 * {
 *   success: false,
 *   message: "Unspecified error occured.",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 */
export async function updateGadgetRoute(req, res) {
  if (!req.body.name && !req.body.status) {
    res.status(StatusCodes.BAD_REQUEST).json(
      {
        success: false,
        message: "Body is missing status and name parameter.",
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
  }

  const params_id = req.params.id;
  const query_id = req.query.id;

  if (params_id) {
    const updateEvent = await updateGadget(
      params_id,
      req.body.name ? req.body.name : capitalize(req.body.status),
    );

    updateEvent.ok
      ? res.status(StatusCodes.OK).json(
        {
          success: true,
          message: "Gadget was updated successfully.",
          data: [],
          meta: {
            time: new Date().toLocaleString(),
            requestID: res.locals.requestID,
          },
        } satisfies JSONResponse,
      )
      : res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(
        {
          success: false,
          message: "Unspecified error occured.",
          data: [],
          meta: {
            time: new Date().toLocaleString(),
            requestID: res.locals.requestID,
          },
        } satisfies JSONResponse,
      );

    return;
  }

  if (query_id) {
    const updateEvent = await updateGadget(
      query_id.toString(),
      req.body.name ? req.body.name : req.body.status,
    );

    updateEvent.ok
      ? res.status(StatusCodes.OK).json(
        {
          success: true,
          message: "Gadget was updated successfully.",
          data: [],
          meta: {
            time: new Date().toLocaleString(),
            requestID: res.locals.requestID,
          },
        } satisfies JSONResponse,
      )
      : res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(
        {
          success: false,
          message: "Unspecified error occured.",
          data: [],
          meta: {
            time: new Date().toLocaleString(),
            requestID: res.locals.requestID,
          },
        } satisfies JSONResponse,
      );
    return;
  }
}

// app.delete("/gadgets:/id")
/**
 * Decommissions (soft deletes) a gadget by its ID
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @description
 * Decommissions a gadget identified either by URL parameter ID or query parameter ID.
 * This is a soft delete operation that changes the gadget's status to "Decommissioned"
 * rather than removing it from the database.
 *
 * @param {string} [req.params.id] - Gadget ID from URL parameter
 *
 * @param {string} [req.query.id] - Gadget ID from query parameter
 *
 * @throws {JSONResponse} Returns 500 Internal Server Error if:
 *  - Gadget with specified ID doesn't exist
 *  - Database operation fails
 *  - Other unspecified errors occur
 *
 * @example
 * // Request URL examples
 * DELETE /gadgets/123e4567-e89b-12d3-a456-426614174000
 * DELETE /gadgets?id=123e4567-e89b-12d3-a456-426614174000
 *
 * @example
 * // Successful response (200 OK)
 * {
 *   success: true,
 *   message: "Gadget successfully decommissioned",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 *
 * @example
 * // Error response (500 Internal Server Error)
 * {
 *   success: false,
 *   message: "Error message from operation",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 */
export async function deleteGadgetRoute(req, res) {
  const params_id = req.params.id;
  const query_id = req.query.id?.toString();

  const result = await decommissionGadget(params_id ? params_id : query_id!);

  if (!result.ok) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
      {
        success: false,
        message: result.message!,
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
  }

  res.status(StatusCodes.OK).json(
    {
      success: true,
      message: result.message,
      data: [],
      meta: {
        time: new Date().toLocaleString(),
        requestID: res.locals.requestID,
      },
    } satisfies JSONResponse,
  );
}

// app.post("/gadgets/:id/self-destruct")
/**
 * Initiates the self-destruct sequence for a gadget
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @description
 * Changes a gadget's status to "Destroyed" when the correct confirmation code is provided.
 * Currently uses a hardcoded confirmation code "0000" for testing purposes.
 *
 * @param {string} req.params.id - ID of the gadget to destroy
 *
 * @security
 * - Requires confirmation code verification
 * - This is a destructive operation that cannot be undone
 * - Should implement proper confirmation code validation in production
 *
 * @throws {JSONResponse} Returns 400 Bad Request if:
 *  - Gadget with specified ID doesn't exist
 *  - Gadget is already destroyed
 *  - Operation fails for any other reason
 *
 * @example
 * // Request URL example
 * POST /gadgets/123e4567-e89b-12d3-a456-426614174000/self-destruct
 *
 * @example
 * // Successful response (200 OK)
 * {
 *   success: true,
 *   message: "Gadget successfully destroyed",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 *
 * @example
 * // Error response (400 Bad Request)
 * {
 *   success: false,
 *   message: "Error message from operation",
 *   data: [],
 *   meta: {
 *     time: "3/14/2024, 12:00:00 PM",
 *     requestID: "uuid-string"
 *   }
 * }
 *
 * @todo
 * - Implement proper confirmation code validation
 * - Add rate limiting
 * - Add additional security measures
 */
export async function destructGadget(req, res) {
  const confirmation_code = "0000";
  const gadget_id = req.params.id;

  if (confirmation_code) {
    const result = await destroyGadget(gadget_id);

    if (!result.ok) {
      res.status(StatusCodes.BAD_REQUEST).json(
        {
          success: false,
          message: result.message,
          data: [],
          meta: {
            time: new Date().toLocaleString(),
            requestID: res.locals.requestID,
          },
        } satisfies JSONResponse,
      );
      return;
    }

    res.status(StatusCodes.OK).json(
      {
        success: true,
        message: result.message,
        data: [],
        meta: {
          time: new Date().toLocaleString(),
          requestID: res.locals.requestID,
        },
      } satisfies JSONResponse,
    );
    return;
  }
}
