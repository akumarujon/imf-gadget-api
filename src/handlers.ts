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

  res.status(StatusCodes.CREATED).json(
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
