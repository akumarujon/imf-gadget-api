import { UUIDTypes } from "uuid";

export type GadgetStatus =
  | "Available"
  | "Deployed"
  | "Destroyed"
  | "Decommissioned";

export type Gadget = {
  id: UUIDTypes;
  name: string;
  status: GadgetStatus;
};
