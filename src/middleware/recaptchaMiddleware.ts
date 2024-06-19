import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { NextFunction, Request, Response } from "express";

const recaptchaMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const client = new RecaptchaEnterpriseServiceClient();
    const proj = await client.getProjectId();
    console.log(proj);
    const response = await client.createAssessment({
      assessment: {
        event: {
          expectedAction: "email-exists",
          token: req.header("Vnd.Bilt.Recaptcha"),
          siteKey: process.env.GCP_RECAPTCHA_KEY,
        },
      },
    });

    console.log(response);

    // const secret_key = process.env.RECAPTCHA_KEY;
    // const token = req.header("Vnd.Bilt.Recaptcha");
    // console.log(secret_key, token);
    // const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

    // const response = await fetch(url, {
    //   method: "post",
    // });
    // if (!response.ok) {
    //   throw new Error("reCAPTCHA verification failed");
    // }

    // const json = await response.json();
    // console.log(json);
    // if (!json.success) {
    //   throw new Error("reCAPTCHA verification failed");
    // }
    next();
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err });
  }
};

export default recaptchaMiddleware;
