import express from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} from '../controllers/expenses.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', getExpenseSummary);
router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
