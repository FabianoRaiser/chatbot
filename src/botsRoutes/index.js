import express from 'express'
import maiaRoute from './maia.js';
import cartorioRoute from './cartorio.js';


const router = express.Router();

router.use('/maia', maiaRoute);
router.use('/cartorio', cartorioRoute)

export default router;