const express = require('express');
const maiaRoute = require('./maia');


const router = express.Router();

router.use('/maia', maiaRoute);

export default router;