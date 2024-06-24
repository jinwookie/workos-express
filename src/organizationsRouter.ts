import { Request, Response, Router } from "express";
import { ORG_ID_HEADER, USER_ID_HEADER } from "./headers";
import authMiddleware from "./middleware/authMiddleware";
import {
  createOrganization,
  getOrganization,
  getOrganizationBySlug,
} from "./sql/organizationsRepository";
import { workos } from "./workos";

const organizationsRouter = Router();

const { organizations, userManagement } = workos;

organizationsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const org = await organizations.createOrganization({
      name: req.body.name,
    });

    await createOrganization({
      orgId: org.id,
      slug: req.body.customUrlPath,
    });

    let userId = req.header(USER_ID_HEADER) ?? req.body.userId;

    const membership = await userManagement.createOrganizationMembership({
      organizationId: org.id,
      userId: userId ?? "",
    });

    res.status(201).json({
      organization: org,
      membership,
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

organizationsRouter.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.query.slug) {
        res.status(400).json({ message: "Slug is required" });
        return;
      }

      const org = await getOrganizationBySlug(req.query.slug as string);

      if (!org) {
        res.status(404).json({ message: "Organization not found" });
        return;
      }

      if (org.org_id !== req.headers[ORG_ID_HEADER]) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }

      const memberships = await userManagement.listOrganizationMemberships({
        organizationId: org.org_id,
        userId: req.headers[USER_ID_HEADER] as string,
      });

      if (memberships.data.length === 0) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }

      res.json(org);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

organizationsRouter.get(
  "/:orgId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;
      const org = await getOrganization(orgId);
      res.json(org);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

export default organizationsRouter;
