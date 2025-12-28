import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

import { getResource,getResourceById,createResource,
    updateResource,
    deleteResource } from '../controllers/Resource.controller.js'



const router = Router()


router.route('/').get(verifyJWT, getResource)

router.route('/:id').get(verifyJWT, getResourceById)

router.route('/').post(verifyJWT,createResource)

router.route('/:id').put(verifyJWT,updateResource)

router.route('/:id').delete(verifyJWT,deleteResource)


export default router