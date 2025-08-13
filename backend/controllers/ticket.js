import Ticket from '../models/ticket.js'
import { inngest } from '../inngest/client.js'

export const createTicket = async (req, res) => {
    try {
        const { title, description } = req.body
        if (!title || !description) {
            return res
                .status(400)
                .json({ message: "Title and description are required" });
        }

        const newTicket = Ticket.create({
            title,
            description,
            createdBy: req.user._id.toString()

        });
        await inngest.send({
            name: "ticket/created",
            data: {
                ticketId: (await newTicket)._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString(),
            },
        });

        return res.status(201).json({
            message: "Ticket created and processing started",
            ticket: newTicket,
        });
    } catch (error) {
        console.error("Error creating ticket", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getTickets = async (req, res) => {
    try {
        const user = req.user;
        let tickets = [];
        if (user.role !== "user") {
            tickets = await Ticket.find({})
                .populate({
                    path: "assignedTo",
                    select: "email _id"
                })
                .sort({ createdAt: -1 });

        } else {
            tickets = await Ticket.find({ createdBy: user._id })
                .select("title description status createdAt assignedTo")
                .populate({
                    path: "assignedTo",
                    select: "email _id"
                })
                .sort({ createdAt: -1 });
        }
        return res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching tickets", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTicket = async (req, res) => {
    try {
        const user = req.user;
        let ticket;

        if (user.role !== "user") {
            ticket = await Ticket.findById(req.params.id)
                .populate("assignedTo", ["email", "_id"])
                .populate("createdBy", ["email", "_id"]);
        } else {
            ticket = await Ticket.findOne({
                createdBy: user._id,
                _id: req.params.id,
            }).select(
                "title description status createdAt helpfulNotes relatedSkills priority"
            );
        }

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        return res.status(200).json({ ticket });
    } catch (error) {
        console.error("Error fetching ticket", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export const updateTicket = async (req, res) => {
    try {
        const { status, helpfulNotes } = req.body;
        if (!status || !helpfulNotes) {
            return res.status(400).json({ message: "Status and HelpfulNotes are Null" });
        }

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        console.log("Ticket found", ticket.title);

        await Ticket.findByIdAndUpdate(req.params.id, { status, helpfulNotes });

        console.log("Ticket updated", req.params.id);

        const updatedTicket = await Ticket.findById(req.params.id)
            .populate("assignedTo", ["_id", "email"]);

        await inngest.send({
            name: "ticket/closed",
            data: {
                ticketId: updatedTicket._id.toString(),
                title: updatedTicket.title,
                description: updatedTicket.description,
                status: updatedTicket.status,
                createdBy: req.user._id.toString(),
                assignedTo: updatedTicket.assignedTo
                    ? {
                        _id: updatedTicket.assignedTo._id.toString(),
                        email: updatedTicket.assignedTo.email
                    }
                    : null
            }
        });

        return res.status(201).json({
            message: "Ticket updated",
            ticket: updatedTicket
        });
    } catch (error) {
        console.error("Error updating a ticket", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getMyTickets = async (req, res) => {
    try {
        const userId = req.user._id;
        const ticketId = req.params.id;

        if (ticketId) {
            const ticket = await Ticket.findOne({
                _id: ticketId,
                createdBy: userId
            })
                .select("title description status createdAt assignedTo")
                .populate({
                    path: "assignedTo",
                    select: "email _id"
                });

            if (!ticket) {
                return res.status(404).json({ message: "Ticket not found or not owned by you" });
            }

            return res.status(200).json(ticket);
        }
        const tickets = await Ticket.find({ createdBy: userId })
            .select("title description status createdAt assignedTo")
            .populate({
                path: "assignedTo",
                select: "email _id"
            })
            .sort({ createdAt: -1 });

        return res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching user's tickets", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};




export const updateAssignee = async (req, res) => {
    try {
        const { assignedTo } = req.body

        const ticket = await Ticket.findById(req.params.id)

        console.log("Ticket found", ticket.title)

        if (!ticket) return res.status(401).json({ error: "Ticket not found" })

        await Ticket.findByIdAndUpdate(req.params.id,
            { assignedTo: assignedTo || null })

        console.log("Ticket updated", req.params.id)
        const updatedTicket = await Ticket.findById(req.params.id)

        // Send event to inngest for processing
        console.log("Sending event to inngest for ticket closed event")
        await inngest.send({
            name: "ticket/closed",
            data: {
                ticketId: updatedTicket._id.toString(),
                title: updatedTicket.title,
                description: updatedTicket.description,
                status: updatedTicket.status,
                createdBy: req.user._id.toString(),
                assignedTo: updatedTicket.assignedTo ? updatedTicket.assignedTo.toString() : null
            }
        });
        return res.status(201).json({
            message: "Ticket updated",
            ticket: updatedTicket
        });
    } catch (error) {
        console.error("Error updating a ticket", error.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}