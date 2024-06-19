import { Request, Response, Router } from "express";
import { workos } from "./workos";

const invitationsRouter = Router();

invitationsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const organizationId = req.headers["wos-user-id"] as string;
    const invitations = await workos.userManagement.listInvitations({
      organizationId,
    });
    res.json(invitations.data);
  } catch (err) {
    res.status(400).json(err);
  }
});

invitationsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const organizationId = req.headers["wos-user-id"] as string;
    const invitation = await workos.userManagement.sendInvitation({
      email: req.body.email,
      organizationId,
    });
    res.status(201).json(invitation);
  } catch (err) {
    res.status(400).json(err);
  }
});

export default invitationsRouter;
