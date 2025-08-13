import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
    createTicket,
    getMyTickets,
    getTicket,
    getTickets,
    updateAssignee,
    updateTicket
} from "../controllers/ticket.js";

const router = express.Router();

router.get("/", authenticate, getTickets);
router.get("/my-tickets", authenticate, getMyTickets);
router.get("/my-tickets/:id", authenticate, getMyTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);
router.put("/:id/update", authenticate, updateTicket);
router.put("/:id/changeAssignee", authenticate, updateAssignee);

export default router;
