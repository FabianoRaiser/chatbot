import express from 'express'
import maiaRoute from './maia.js';


const router = express.Router();

router.use('/maia', maiaRoute);

export default router;