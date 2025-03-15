import { app } from "./app";
import {
  createGadget,
  decommissionGadget,
  deleteGadget,
  getGadget,
  getGadgets,
  getGadgetsByStatus,
  updateGadget,
} from "./controllers";

app.get(["/gadgets", "/gadgets/:id"], async (req, res) => {
  const id = req.params.id;
  if (id) {
    res.send(await getGadget(id));
  }

  let query_status = req.query.status;

  if (query_status) {
    query_status = query_status.toString().toLowerCase();

    type GadgetStatus =
      | "Available"
      | "Deployed"
      | "Destroyed"
      | "Decommissioned";
    const listStatus = new Set([
      "Available",
      "Deployed",
      "Destroyed",
      "Decommissioned",
    ]);
    const normalizedStatus = query_status.charAt(0).toUpperCase() +
      query_status.slice(1).toLowerCase();

    if (listStatus.has(normalizedStatus)) {
      const result = await getGadgetsByStatus(query_status as GadgetStatus);

      res.status(200);
      res.send(result);
    }
  }

  res.json(await getGadgets());
});

app.post("/gadgets", async (req, res) => {
  if (!req.body.name || !req.body.status) {
    res.status(400);
    res.json({
      status: 400,
      error: "Body is missing status or name parameter.",
    });
  }

  await createGadget(req, res);

  res.status(200);
  res.json({
    status: 200,
    message: "Gadget is created successfully",
  });
});

app.patch("/gadgets/:id", async (req, res) => {
  const body = req.body;

  if (!req.body.name && !req.body.status) {
    res.status(400);
    res.json({
      status: 400,
      error: "Body is missing status and name parameter.",
    });
  }

  const params_id = req.params.id;
  const query_id = req.query.id;

  if (params_id) {
    const updateEvent = await updateGadget(
      params_id,
      req.body.name ? req.body.name : req.body.status,
    );

    res.json(
      updateEvent.ok
        ? { status: 200, message: "Gadget was updated successfully" }
        : { status: 422, message: "Unspecified error occured" },
    );
    return;
  }

  if (query_id) {
    const updateEvent = await updateGadget(
      query_id.toString(),
      req.body.name ? req.body.name : req.body.status,
    );

    res.json(
      updateEvent.ok
        ? { status: 200, message: "Gadget was updated successfully" }
        : { status: 422, message: "Unspecified error occured" },
    );
    return;
  }
});

app.delete("/gadgets/:id", async (req, res) => {
  const params_id = req.params.id;
  const query_id = req.query.id?.toString();

  const result = await decommissionGadget(params_id ? params_id : query_id!);

  if (!result.ok) res.json({ message: result.message });

  res.status(200);
  res.json({ status: 200, message: "Gadget is decommissioned successfully." });
});

app.post("/gadgets/:id/self-destruct", async (req, res) => {
  const confirmation_code = "0000";
  const gadget_id = req.params.id;

  if (confirmation_code) {
    const result = await deleteGadget(gadget_id);

    if (!result.ok) {
      res.status(400);
      res.send({ message: result.message });
      return;
    }

    res.send(result.message);
    return;
  }
});
