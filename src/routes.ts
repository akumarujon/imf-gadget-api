import { app } from "./app";
import {
  createGadget,
  decommissionGadget,
  destroyGadget,
  getGadget,
  getGadgets,
  getGadgetsByStatus,
  updateGadget,
} from "./controllers";
import { GadgetStatus, JSONResponse } from "./types";
import { capitalize, isCapitalized } from "./utils";

import { StatusCodes } from "http-status-codes";

app.get("/", (req, res) => {
  res.status(302).redirect("/docs");
});

app.get(["/gadgets", "/gadgets/:id"], async (req, res) => {
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
});

app.post("/gadgets", async (req, res) => {
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
});

app.patch("/gadgets/:id", async (req, res) => {
  const body = req.body;

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
});

app.delete("/gadgets/:id", async (req, res) => {
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
});

app.post("/gadgets/:id/self-destruct", async (req, res) => {
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
});
