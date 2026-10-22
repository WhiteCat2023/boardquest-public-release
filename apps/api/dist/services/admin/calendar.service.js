import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import { createNotification } from "./notification.service";
import { sendCalendarEventInvitationEmail, sendCalendarEventReminderEmail, } from "../mail.service";
export function evaluateScheduleStatus(startDate, endDate, referenceDate = new Date()) {
    if (!startDate || !endDate)
        return "UPCOMING";
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const current = new Date(referenceDate);
    current.setHours(0, 0, 0, 0);
    if (isNaN(start.getTime()) || isNaN(end.getTime()))
        return "UPCOMING";
    const currentTime = current.getTime();
    if (currentTime < start.getTime())
        return "UPCOMING";
    if (currentTime > end.getTime())
        return "COMPLETED";
    return "ONGOING";
}
function extractSchoolYear(item) {
    if (item.description) {
        const match = item.description.match(/\[SY:(\d{4}-\d{4})\]/);
        if (match && match[1])
            return match[1];
    }
    if (!item.startDate && !item.createdAt)
        return "2026-2027";
    const d = new Date(item.startDate || item.createdAt);
    if (isNaN(d.getTime()))
        return "2026-2027";
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}
function mapProgramToSchedule(item) {
    const schoolYear = extractSchoolYear(item);
    const description = (item.description || "")
        .replace(/\[SY:\d{4}-\d{4}\]\s*/g, "")
        .trim();
    return {
        id: item.id,
        title: item.title,
        companyName: item.companyName || "Review Center Partner",
        category: item.category || "Board Review",
        startDate: item.startDate
            ? new Date(item.startDate).toISOString().split("T")[0]
            : "2026-07-01",
        endDate: item.endDate
            ? new Date(item.endDate).toISOString().split("T")[0]
            : "2026-07-15",
        status: evaluateScheduleStatus(item.startDate, item.endDate),
        description,
        schoolYear,
        createdAt: item.createdAt,
    };
}
export async function getAllReviewSchedules() {
    const list = await prisma.reviewCenterProgram.findMany({
        orderBy: { createdAt: "desc" },
    });
    return list.map(mapProgramToSchedule);
}
export async function getReviewScheduleById(id) {
    const item = await prisma.reviewCenterProgram.findUnique({
        where: { id },
    });
    if (!item) {
        return null;
    }
    return mapProgramToSchedule(item);
}
export async function createReviewSchedule(data) {
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const endDate = data.endDate ? new Date(data.endDate) : new Date();
    const status = evaluateScheduleStatus(startDate, endDate);
    const created = await prisma.reviewCenterProgram.create({
        data: {
            title: data.title,
            companyName: data.companyName || "Institutional (BoardQuest)",
            reviewCenterId: null, // Admin only sets institutional game final review schedules
            category: data.category || "Final Comprehensive Review",
            startDate,
            endDate,
            status,
            description: data.description || "",
        },
    });
    const mapped = mapProgramToSchedule(created);
    notifyReviewScheduleParticipants(mapped).catch((err) => {
        console.warn("[CalendarService] Error notifying review schedule participants:", err);
    });
    return mapped;
}
export async function updateReviewSchedule(id, data) {
    const existing = await prisma.reviewCenterProgram.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new ApiError(404, "Review schedule not found");
    }
    // Internal accounts cannot edit schedules that the review center representative set for their organization
    const isReviewCenterSchedule = Boolean(existing.reviewCenterId) ||
        (Boolean(existing.companyName) &&
            existing.companyName?.trim() !== "Institutional (BoardQuest)");
    if (isReviewCenterSchedule) {
        throw new ApiError(403, "Access Denied: Internal accounts cannot edit schedules that the review center representative set for their organization.");
    }
    const newStartDate = data.startDate
        ? new Date(data.startDate)
        : existing.startDate;
    const newEndDate = data.endDate ? new Date(data.endDate) : existing.endDate;
    const status = evaluateScheduleStatus(newStartDate, newEndDate);
    const updated = await prisma.reviewCenterProgram.update({
        where: { id },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.category && { category: data.category }),
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
            status,
            ...(data.description !== undefined && { description: data.description }),
        },
    });
    return mapProgramToSchedule(updated);
}
export async function deleteReviewSchedule(id) {
    const existing = await prisma.reviewCenterProgram.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new ApiError(404, "Review schedule not found");
    }
    // Internal accounts cannot delete schedules that the review center representative set for their organization
    const isReviewCenterSchedule = Boolean(existing.reviewCenterId) ||
        (Boolean(existing.companyName) &&
            existing.companyName?.trim() !== "Institutional (BoardQuest)");
    if (isReviewCenterSchedule) {
        throw new ApiError(403, "Access Denied: Internal accounts cannot delete schedules that the review center representative set for their organization.");
    }
    await prisma.reviewCenterProgram.delete({
        where: { id },
    });
    return true;
}
const CALENDAR_EVENTS_COLLECTION = "CalendarEvents";
function formatEventDoc(doc) {
    if (!doc)
        return null;
    const id = doc._id?.$oid ||
        (typeof doc._id === "string" ? doc._id : doc._id?.toString?.() || doc.id);
    let startStr = "";
    if (doc.startDate) {
        if (typeof doc.startDate === "string") {
            startStr = doc.startDate.split("T")[0];
        }
        else if (doc.startDate.$date) {
            startStr = new Date(doc.startDate.$date).toISOString().split("T")[0];
        }
        else {
            startStr = new Date(doc.startDate).toISOString().split("T")[0];
        }
    }
    else {
        startStr = new Date().toISOString().split("T")[0];
    }
    let endStr = startStr;
    if (doc.endDate) {
        if (typeof doc.endDate === "string") {
            endStr = doc.endDate.split("T")[0];
        }
        else if (doc.endDate.$date) {
            endStr = new Date(doc.endDate.$date).toISOString().split("T")[0];
        }
        else {
            endStr = new Date(doc.endDate).toISOString().split("T")[0];
        }
    }
    return {
        id,
        title: doc.title || "Untitled Event",
        category: doc.category || "Events",
        startDate: startStr,
        endDate: endStr,
        startTime: doc.startTime || "",
        endTime: doc.endTime || "",
        location: doc.location || "",
        link: doc.link || "",
        conferenceType: doc.conferenceType || "Online",
        description: doc.description || "",
        companyName: doc.companyName || "",
        status: doc.status || "UPCOMING",
        colorKey: doc.colorKey || "purple",
        labels: Array.isArray(doc.labels) ? doc.labels : [],
        startReminderSent: Boolean(doc.startReminderSent),
        endReminderSent: Boolean(doc.endReminderSent),
        attendees: Array.isArray(doc.attendees) ? doc.attendees : [],
        attachments: Array.isArray(doc.attachments) ? doc.attachments : [],
        solutionNotes: doc.solutionNotes || "",
        authorId: doc.authorId || "",
        authorName: doc.authorName || "",
        authorEmail: doc.authorEmail || "",
        createdBy: doc.createdBy || doc.authorId || "",
        createdAt: doc.createdAt?.$date || doc.createdAt,
        updatedAt: doc.updatedAt?.$date || doc.updatedAt,
    };
}
export function isUserEventAttendeeOrAuthor(event, user) {
    if (!user)
        return true;
    const role = String(user.role || "").toUpperCase();
    if (role === "SUPERADMIN")
        return true;
    const userId = String(user.id || "").trim();
    const userEmail = String(user.email || "").trim().toLowerCase();
    const userName = String(user.name || "").trim().toLowerCase();
    // 1. Is user the author or creator?
    const isAuthor = (event.authorId && String(event.authorId).trim() === userId) ||
        (event.authorEmail && String(event.authorEmail).trim().toLowerCase() === userEmail) ||
        (event.authorName && String(event.authorName).trim().toLowerCase() === userName) ||
        (event.createdBy && ((typeof event.createdBy === "string" && ((userId && String(event.createdBy).trim() === userId) ||
            (userEmail && String(event.createdBy).trim().toLowerCase() === userEmail) ||
            (userName && String(event.createdBy).trim().toLowerCase() === userName))) ||
            (typeof event.createdBy === "object" && ((userId && String(event.createdBy.id).trim() === userId) ||
                (userEmail && String(event.createdBy.email).trim().toLowerCase() === userEmail) ||
                (userName && String(event.createdBy.name).trim().toLowerCase() === userName)))));
    if (isAuthor)
        return true;
    // 2. Is user listed in attendees array?
    if (Array.isArray(event.attendees)) {
        const isAttendee = event.attendees.some((a) => {
            if (!a)
                return false;
            if (typeof a === "string") {
                const str = a.trim().toLowerCase();
                return (userEmail && str === userEmail) || (userName && str === userName);
            }
            const aEmail = String(a.email || "").trim().toLowerCase();
            const aName = String(a.name || "").trim().toLowerCase();
            const aId = String(a.id || a._id || a.userId || "").trim();
            return ((userEmail && (aEmail === userEmail || aName === userEmail)) ||
                (userId && aId && aId === userId) ||
                (userName && aName === userName));
        });
        if (isAttendee)
            return true;
    }
    return false;
}
export async function getAllCalendarEvents(user) {
    try {
        const res = await prisma.$runCommandRaw({
            find: CALENDAR_EVENTS_COLLECTION,
            filter: {},
            sort: { startDate: 1, createdAt: -1 },
        });
        const list = (res?.cursor?.firstBatch || []).map(formatEventDoc);
        if (!user)
            return list;
        return list.filter((event) => isUserEventAttendeeOrAuthor(event, user));
    }
    catch (err) {
        console.error("Error fetching CalendarEvents from DB:", err);
        return [];
    }
}
export async function getCalendarEventById(id) {
    let doc = null;
    try {
        const res = await prisma.$runCommandRaw({
            find: CALENDAR_EVENTS_COLLECTION,
            filter: { _id: { $oid: id } },
            limit: 1,
        });
        doc = res?.cursor?.firstBatch?.[0];
    }
    catch {
        const res = await prisma.$runCommandRaw({
            find: CALENDAR_EVENTS_COLLECTION,
            filter: { _id: id },
            limit: 1,
        });
        doc = res?.cursor?.firstBatch?.[0];
    }
    if (!doc)
        return null;
    return formatEventDoc(doc);
}
export async function createCalendarEvent(data) {
    const now = new Date();
    const startDateStr = data.startDate || now.toISOString().split("T")[0];
    const endDateStr = data.endDate || startDateStr;
    const docToInsert = {
        title: data.title,
        category: data.category || "Events",
        startDate: startDateStr,
        endDate: endDateStr,
        startTime: data.startTime || "",
        endTime: data.endTime || "",
        location: data.location || "",
        link: data.link || "",
        conferenceType: data.conferenceType || "Online",
        description: data.description || "",
        companyName: data.companyName || "",
        status: data.status || "UPCOMING",
        colorKey: data.colorKey || "purple",
        labels: Array.isArray(data.labels) ? data.labels : [],
        startReminderSent: false,
        endReminderSent: false,
        attendees: Array.isArray(data.attendees) ? data.attendees : [],
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        solutionNotes: data.solutionNotes || "",
        authorId: data.authorId || "",
        authorName: data.authorName || "",
        authorEmail: data.authorEmail || "",
        createdBy: data.createdBy || data.authorId || "",
        createdAt: now,
        updatedAt: now,
    };
    await prisma.$runCommandRaw({
        insert: CALENDAR_EVENTS_COLLECTION,
        documents: [docToInsert],
    });
    // Query back the newly created event
    const res = await prisma.$runCommandRaw({
        find: CALENDAR_EVENTS_COLLECTION,
        filter: {
            title: docToInsert.title,
            createdAt: now,
        },
        limit: 1,
    });
    const doc = res?.cursor?.firstBatch?.[0];
    const createdEvent = formatEventDoc(doc || docToInsert);
    // Notify all attendees immediately (in-app notification & email invitation)
    notifyAttendeesOfCalendarEvent(createdEvent, "INVITATION").catch((err) => {
        console.warn("[CalendarService] Error notifying attendees of new event:", err);
    });
    return createdEvent;
}
export async function updateCalendarEvent(id, data) {
    const existing = await getCalendarEventById(id);
    if (!existing) {
        throw new ApiError(404, "Calendar event not found");
    }
    const now = new Date();
    const updatePayload = {
        updatedAt: now,
    };
    if (data.title !== undefined)
        updatePayload.title = data.title;
    if (data.category !== undefined)
        updatePayload.category = data.category;
    if (data.startDate !== undefined) {
        updatePayload.startDate = data.startDate;
        if (data.startDate !== existing.startDate) {
            updatePayload.startReminderSent = false;
        }
    }
    if (data.endDate !== undefined) {
        updatePayload.endDate = data.endDate;
        if (data.endDate !== existing.endDate) {
            updatePayload.endReminderSent = false;
        }
    }
    if (data.startTime !== undefined)
        updatePayload.startTime = data.startTime;
    if (data.endTime !== undefined)
        updatePayload.endTime = data.endTime;
    if (data.location !== undefined)
        updatePayload.location = data.location;
    if (data.link !== undefined)
        updatePayload.link = data.link;
    if (data.conferenceType !== undefined)
        updatePayload.conferenceType = data.conferenceType;
    if (data.description !== undefined)
        updatePayload.description = data.description;
    if (data.companyName !== undefined)
        updatePayload.companyName = data.companyName;
    if (data.status !== undefined)
        updatePayload.status = data.status;
    if (data.colorKey !== undefined)
        updatePayload.colorKey = data.colorKey;
    if (data.labels !== undefined)
        updatePayload.labels = data.labels;
    if (data.startReminderSent !== undefined)
        updatePayload.startReminderSent = data.startReminderSent;
    if (data.endReminderSent !== undefined)
        updatePayload.endReminderSent = data.endReminderSent;
    if (data.attendees !== undefined)
        updatePayload.attendees = data.attendees;
    if (data.attachments !== undefined)
        updatePayload.attachments = data.attachments;
    if (data.solutionNotes !== undefined)
        updatePayload.solutionNotes = data.solutionNotes;
    if (data.authorId !== undefined)
        updatePayload.authorId = data.authorId;
    if (data.authorName !== undefined)
        updatePayload.authorName = data.authorName;
    if (data.authorEmail !== undefined)
        updatePayload.authorEmail = data.authorEmail;
    if (data.createdBy !== undefined)
        updatePayload.createdBy = data.createdBy;
    try {
        await prisma.$runCommandRaw({
            update: CALENDAR_EVENTS_COLLECTION,
            updates: [
                {
                    q: { _id: { $oid: id } },
                    u: { $set: updatePayload },
                },
            ],
        });
    }
    catch {
        await prisma.$runCommandRaw({
            update: CALENDAR_EVENTS_COLLECTION,
            updates: [
                {
                    q: { _id: id },
                    u: { $set: updatePayload },
                },
            ],
        });
    }
    const updated = await getCalendarEventById(id);
    const result = updated || { ...existing, ...updatePayload };
    // If new attendees were added, send them invitations
    if (data.attendees && Array.isArray(data.attendees)) {
        const existingEmails = new Set((existing.attendees || []).map((a) => (typeof a === "string" ? a : a.email || a.name || "")
            .trim()
            .toLowerCase()));
        const newlyAddedAttendees = data.attendees.filter((a) => {
            const email = (typeof a === "string" ? a : a.email || a.name || "")
                .trim()
                .toLowerCase();
            return email && !existingEmails.has(email);
        });
        if (newlyAddedAttendees.length > 0) {
            notifyAttendeesOfCalendarEvent({ ...result, attendees: newlyAddedAttendees }, "INVITATION").catch((err) => {
                console.warn("[CalendarService] Error notifying newly added attendees:", err);
            });
        }
    }
    return result;
}
export async function deleteCalendarEvent(id) {
    const existing = await getCalendarEventById(id);
    if (!existing) {
        throw new ApiError(404, "Calendar event not found");
    }
    try {
        await prisma.$runCommandRaw({
            delete: CALENDAR_EVENTS_COLLECTION,
            deletes: [{ q: { _id: { $oid: id } }, limit: 1 }],
        });
    }
    catch {
        await prisma.$runCommandRaw({
            delete: CALENDAR_EVENTS_COLLECTION,
            deletes: [{ q: { _id: id }, limit: 1 }],
        });
    }
    return true;
}
/**
 * Dispatches in-app notification and email to all attendees involved in a CalendarEvent
 */
export async function notifyAttendeesOfCalendarEvent(event, type = "INVITATION") {
    if (!event || !Array.isArray(event.attendees) || event.attendees.length === 0) {
        return { notifiedCount: 0, emailedCount: 0 };
    }
    const attendeeList = [];
    const seenEmails = new Set();
    for (const att of event.attendees) {
        let email = "";
        let name = "";
        if (typeof att === "string") {
            name = att;
            if (att.includes("@")) {
                email = att.trim().toLowerCase();
            }
        }
        else if (att && typeof att === "object") {
            name = att.name || "";
            if (att.email && att.email.includes("@")) {
                email = att.email.trim().toLowerCase();
            }
            else if (att.name && att.name.includes("@")) {
                email = att.name.trim().toLowerCase();
            }
        }
        if (email && !seenEmails.has(email)) {
            seenEmails.add(email);
            attendeeList.push({ name: name || email, email });
        }
    }
    let notifiedCount = 0;
    let emailedCount = 0;
    for (const attendee of attendeeList) {
        // 1. Resolve registered user to send in-app notification
        try {
            const [adminUser, studentUser, rcUser] = await Promise.all([
                prisma.adminUser.findFirst({
                    where: { email: { equals: attendee.email, mode: "insensitive" } },
                    select: { id: true, name: true, role: true },
                }),
                prisma.user.findFirst({
                    where: { email: { equals: attendee.email, mode: "insensitive" } },
                    select: { id: true, name: true, role: true },
                }),
                prisma.reviewCenterRepresentativeUser.findFirst({
                    where: { email: { equals: attendee.email, mode: "insensitive" } },
                    select: { id: true, name: true },
                }),
            ]);
            const matchedUser = adminUser || studentUser || rcUser;
            if (matchedUser?.id) {
                let notifTitle = "";
                let notifMessage = "";
                if (type === "INVITATION") {
                    notifTitle = `Event Scheduled: ${event.title}`;
                    notifMessage = `You are scheduled as a participant in "${event.title}" on ${event.startDate}${event.startTime ? ` at ${event.startTime}` : ""}.`;
                }
                else if (type === "START_REMINDER") {
                    notifTitle = `Reminder: "${event.title}" starts tomorrow`;
                    notifMessage = `Your event "${event.title}" begins tomorrow, ${event.startDate}${event.startTime ? ` at ${event.startTime}` : ""}.`;
                }
                else if (type === "END_REMINDER") {
                    notifTitle = `Reminder: "${event.title}" concludes tomorrow`;
                    notifMessage = `Your event "${event.title}" concludes tomorrow, ${event.endDate}${event.endTime ? ` at ${event.endTime}` : ""}.`;
                }
                await createNotification({
                    recipientId: matchedUser.id,
                    recipientRole: matchedUser.role || "ALL",
                    type: "INFO",
                    title: notifTitle,
                    message: notifMessage,
                    link: "/calendar-management",
                    metadata: {
                        eventId: event.id,
                        eventTitle: event.title,
                        startDate: event.startDate,
                        endDate: event.endDate,
                        reminderType: type,
                    },
                });
                notifiedCount++;
            }
        }
        catch (notifErr) {
            console.warn(`[CalendarService] Failed to create in-app notification for ${attendee.email}:`, notifErr?.message);
        }
        // 2. Send email notification via mailService
        try {
            if (type === "INVITATION") {
                await sendCalendarEventInvitationEmail({
                    toEmail: attendee.email,
                    recipientName: attendee.name,
                    eventTitle: event.title,
                    category: event.category,
                    startDate: event.startDate,
                    endDate: event.endDate,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    location: event.location,
                    link: event.link,
                    description: event.description,
                    organizerName: event.authorName || "BoardQuest Admin",
                });
                emailedCount++;
            }
            else {
                const isStart = type === "START_REMINDER";
                await sendCalendarEventReminderEmail({
                    toEmail: attendee.email,
                    recipientName: attendee.name,
                    eventTitle: event.title,
                    reminderType: isStart ? "START" : "END",
                    targetDate: isStart ? event.startDate : event.endDate,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    location: event.location,
                    link: event.link,
                    description: event.description,
                });
                emailedCount++;
            }
        }
        catch (emailErr) {
            console.warn(`[CalendarService] Failed to send email to ${attendee.email}:`, emailErr?.message);
        }
    }
    return { notifiedCount, emailedCount };
}
/**
 * Notifies candidates / users when a ReviewCenterProgram schedule is created
 */
export async function notifyReviewScheduleParticipants(schedule) {
    try {
        const candidates = await prisma.reviewCenterCandidate.findMany({
            where: schedule.reviewCenterId
                ? { reviewCenterId: schedule.reviewCenterId }
                : {},
            select: { name: true, email: true },
        });
        if (candidates.length === 0)
            return { notifiedCount: 0, emailedCount: 0 };
        const fakeEvent = {
            id: schedule.id,
            title: schedule.title,
            category: schedule.category || "Board Review",
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            description: schedule.description,
            authorName: schedule.companyName || "Institutional (BoardQuest)",
            attendees: candidates,
        };
        return await notifyAttendeesOfCalendarEvent(fakeEvent, "INVITATION");
    }
    catch (err) {
        console.warn("[CalendarService] Error in notifyReviewScheduleParticipants:", err?.message);
        return { notifiedCount: 0, emailedCount: 0 };
    }
}
/**
 * Daily / Hourly recurring check:
 * Finds any events or schedules starting or ending tomorrow, and sends notifications + emails
 * with deduplication so reminders are only sent once.
 */
export async function checkCalendarEventReminders() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    console.log(`[Calendar Reminder] Checking events and schedules for tomorrow (${tomorrowStr})...`);
    let totalProcessed = 0;
    // 1. Process CalendarEvents
    try {
        const allEvents = await getAllCalendarEvents();
        for (const ev of allEvents) {
            // 1 day before start date
            if (ev.startDate === tomorrowStr && !ev.startReminderSent) {
                console.log(`[Calendar Reminder] Dispatching 1-day START reminder for event "${ev.title}" (ID: ${ev.id})`);
                await notifyAttendeesOfCalendarEvent(ev, "START_REMINDER");
                await updateCalendarEvent(ev.id, { startReminderSent: true });
                totalProcessed++;
            }
            // 1 day before end date (if multi-day event)
            if (ev.endDate &&
                ev.endDate !== ev.startDate &&
                ev.endDate === tomorrowStr &&
                !ev.endReminderSent) {
                console.log(`[Calendar Reminder] Dispatching 1-day END reminder for event "${ev.title}" (ID: ${ev.id})`);
                await notifyAttendeesOfCalendarEvent(ev, "END_REMINDER");
                await updateCalendarEvent(ev.id, { endReminderSent: true });
                totalProcessed++;
            }
        }
    }
    catch (err) {
        console.error("[Calendar Reminder] Error checking CalendarEvents:", err?.message);
    }
    // 2. Process ReviewCenterProgram schedules
    try {
        const schedules = await prisma.reviewCenterProgram.findMany({
            where: {
                OR: [
                    {
                        startDate: {
                            gte: new Date(`${tomorrowStr}T00:00:00.000Z`),
                            lte: new Date(`${tomorrowStr}T23:59:59.999Z`),
                        },
                    },
                    {
                        endDate: {
                            gte: new Date(`${tomorrowStr}T00:00:00.000Z`),
                            lte: new Date(`${tomorrowStr}T23:59:59.999Z`),
                        },
                    },
                ],
            },
        });
        for (const sch of schedules) {
            const schStartStr = sch.startDate
                ? new Date(sch.startDate).toISOString().split("T")[0]
                : "";
            const schEndStr = sch.endDate
                ? new Date(sch.endDate).toISOString().split("T")[0]
                : "";
            const candidates = await prisma.reviewCenterCandidate.findMany({
                where: sch.reviewCenterId ? { reviewCenterId: sch.reviewCenterId } : {},
                select: { name: true, email: true },
            });
            if (candidates.length > 0) {
                const fakeEvent = {
                    id: sch.id,
                    title: sch.title,
                    category: sch.category || "Board Review",
                    startDate: schStartStr,
                    endDate: schEndStr,
                    description: sch.description,
                    authorName: sch.companyName || "Review Center Partner",
                    attendees: candidates,
                };
                if (schStartStr === tomorrowStr) {
                    await notifyAttendeesOfCalendarEvent(fakeEvent, "START_REMINDER");
                    totalProcessed++;
                }
                else if (schEndStr === tomorrowStr && schEndStr !== schStartStr) {
                    await notifyAttendeesOfCalendarEvent(fakeEvent, "END_REMINDER");
                    totalProcessed++;
                }
            }
        }
    }
    catch (err) {
        console.error("[Calendar Reminder] Error checking ReviewCenterProgram schedules:", err?.message);
    }
    console.log(`[Calendar Reminder] Completed reminder check. Processed ${totalProcessed} events/schedules.`);
    return { success: true, processedCount: totalProcessed, dateChecked: tomorrowStr };
}
