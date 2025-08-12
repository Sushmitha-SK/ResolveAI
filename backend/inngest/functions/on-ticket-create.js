import { NonRetriableError } from "inngest";
import User from "../../models/user.js";
import Ticket from "../../models/ticket.js";
import { inngest } from "../client.js";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
    { id: "on-ticket-created", retries: 2 },
    { event: "ticket/created" },
    async ({ event, step }) => {
        try {
            const { ticketId } = event.data;

            let ticket = await step.run("fetch-ticket", async () => {
                const ticketObject = await Ticket.findById(ticketId);
                if (!ticketObject) {
                    throw new NonRetriableError("Ticket not found");
                }
                return ticketObject;
            });

            ticket = await step.run("update-ticket-status", async () => {
                return Ticket.findByIdAndUpdate(
                    ticket._id,
                    { status: "TODO" },
                    { new: true }
                );
            });

            const aiResponse = await analyzeTicket(ticket);

            ticket = await step.run("ai-processing", async () => {
                if (!aiResponse) return ticket;

                return Ticket.findByIdAndUpdate(
                    ticket._id,
                    {
                        priority: !["low", "medium", "high"].includes(aiResponse.priority)
                            ? "medium"
                            : aiResponse.priority,
                        helpfulNotes: aiResponse.helpfulNotes || "",
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills || [],
                    },
                    { new: true }
                );
            });

            const moderator = await step.run("assign-moderator", async () => {
                const skillPattern =
                    ticket.relatedSkills?.length > 0
                        ? ticket.relatedSkills.join("|")
                        : ".*";

                let user = await User.findOne({
                    role: "moderator",
                    skills: { $elemMatch: { $regex: skillPattern, $options: "i" } },
                });

                if (!user) {
                    user = await User.findOne({ role: "admin" });
                }

                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null,
                });

                return user;
            });

            await step.run("send-email-notification", async () => {
                if (moderator) {
                    await sendMail(
                        moderator.email,
                        "Ticket Assigned",
                        `A new ticket is assigned to you: ${ticket.title}`
                    );
                }
            });

            return { success: true };
        } catch (err) {
            console.error("Error running the step", err.message);
            return { success: false };
        }
    }
);
