import {
  Router as captchaRoutes,
  Router,
  type Request,
  type Response,
} from "express";
import { generateNewCaptcha } from "../service/captcha.service.ts";

const ServicesRoute: captchaRoutes = Router();

ServicesRoute.get("/captcha", (req: Request, res: Response) => {
  try{
    const captchaPacket = generateNewCaptcha() ;
    res.status(200).json(captchaPacket);
    return
  }catch(error){  
    console.log(error);
    throw error;
  }
});

export { ServicesRoute };
