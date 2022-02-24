import express from "express";
import { protect, authorize } from "../../middlewares/auth.js";
import { createPYQ, deletePYQ, getAllPQY,updatePYQ } from "../../controllers/PYQ/PYQAdminController.js";

const router = express.Router();
import PYQModal from "../../models/PYQModal.js";
import advancedResults from "../../middlewares/advancedResults.js";

router.use(protect);
router.use(authorize('admin'))
router.route("/").get(advancedResults(PYQModal), getAllPQY);

router.route("/").post(createPYQ);
router.route('/:id').put(updatePYQ)
router.route('/:id').delete(deletePYQ)

export default router;
