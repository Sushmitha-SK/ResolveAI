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

                return await Ticket.findByIdAndUpdate(
                    ticket._id,
                    {
                        priority: ["low", "medium", "high"].includes(aiResponse.priority)
                            ? aiResponse.priority
                            : "medium",
                        helpfulNotes: aiResponse.helpfulNotes || "",
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills || [],
                    },
                    { new: true }
                );
            });

            // Always fetch the latest ticket after AI update
            ticket = await Ticket.findById(ticket._id);

            console.log('AI processing', JSON.stringify(aiResponse))

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




export const onTicketClosed = inngest.createFunction(
    { id: 'on-ticket-closed', retries: 2 },
    { event: "ticket/closed" },
    async ({ event, step }) => {
        try {
            const { createdBy, title, status } = event.data
            console.log("Running step for finding ticket owner", { id })
            const user = await step.run("get-user-email", async () => {
                const userObj = await User.findById(createdBy)
                if (!userObj) {
                    throw new NonRetriableError("User no longer exist in DB")
                }
                return userObj
            })

            await step.run("send-close-ticket-mail", async () => {
                const subject = `Status of Ticket: ${title} is ${status}.`
                const messg = `Hi,
              Check the helpful notes for more information.
              \n \n
              Thanks for signing up. Glad to have you!!
              `
                await sendMail(user.email, subject, messg);
            })

            console.log("Ticket closed and email sent to user", { email: user.email })

            return { success: true }
        } catch (err) {
            console.error("Error running step", err.message)
            return { success: false }
        }
    }
)

export const onTicketUpdated = inngest.createFunction(
    { id: 'on-ticket-updated', retries: 2 },
    { event: "ticket/updated" },
    async ({ event, step }) => {
        try {
            const { ticketId, status, assignedTo } = event.data

            const moderator = await User.findById(assignedTo);
            if (!moderator) {
                throw new NonRetriableError("User no longer exist in DB")
            }

            await step.run("send-email-notification", async () => {
                const finalTicket = await Ticket.findById(ticketId)
                if (moderator) {
                    await sendMail(
                        moderator.email,
                        "Ticket Assigned",
                        `Please have a look to ticket which is recently assigned to you.
                      Ticket Id is : ${finalTicket.title}`
                    )
                }
            })

            return { success: true }
        } catch (err) {
            console.error("Error running step", err.message)
            return { success: false }
        }
    }
)