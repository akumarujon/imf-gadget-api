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

/**
 * Something
 */
export interface JSONResponse {
  success: boolean;
  message: string;
  data: Gadget | Gadget[] | { token: string };
  meta: {
    time: string;
    requestID: string;
  };
}
