import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";

dotenv.config();

import invitationsRouter from "./invitationsRouter";
import authMiddleware from "./middleware/authMiddleware";
import { workos } from "./workos";

const app: Express = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

const { userManagement, organizations } = workos;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/get-authorization-url", async (req: Request, res: Response) => {
  const authUrl = await userManagement.getAuthorizationUrl({
    clientId: process.env.WORKOS_CLIENT_ID ?? "",
    redirectUri: process.env.WORKOS_REDIRECT_URI ?? "",
    loginHint: req.query.email as string,
    provider: "authkit",
    state: req.query.state as string,
    screenHint: (req.query.screenHint as "sign-in" | "sign-up") ?? "sign-in",
  });

  res.json({ url: authUrl });
});

app.get("/merchant-portal/user/exist", async (req: Request, res: Response) => {
  const users = await userManagement.listUsers({
    email: req.query.email as string,
  });
  users.data.length > 0
    ? res.json({ exist: true })
    : res.json({ exist: false });
});

app.post("/merchant-portal/user", async (req: Request, res: Response) => {
  try {
    let pendingToken: string | undefined;
    const user = await userManagement.createUser({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      emailVerified: true,
    });

    res.json({ userId: user.id, pendingToken });
  } catch (err) {
    res.status(400).json(err);
  }
});

app.post(
  "/merchant-portal/user/verify",
  async (req: Request, res: Response) => {
    const email = req.body.email;
    const token = req.body.token;
    const users = await userManagement.listUsers({ email });
    if (users.data.length === 0) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const user = users.data[0];

    try {
      const response = await userManagement.verifyEmail({
        code: req.body.code,
        userId: user.id,
      });
      res.json(response.user);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

app.post(
  "/merchant-portal/organization",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const org = await organizations.createOrganization({
        name: req.body.name,
      });

      const userId = req.header("wos-user-id");

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
  }
);

app.use("/merchant-portal/invitations", authMiddleware, invitationsRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
