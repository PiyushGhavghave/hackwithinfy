import { Router } from 'express';
import {getSOSRequests} from "../controllers/getData.controller.js";

const router = Router();

router.get('/', getSOSRequests);

export default router;
