import { deleteComment, getAllComments } from '../controllers/comment.controller';
import { isAdmin } from '../middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/', isAdmin, getAllComments);
router.delete('/:id', isAdmin, deleteComment);

export default router; 