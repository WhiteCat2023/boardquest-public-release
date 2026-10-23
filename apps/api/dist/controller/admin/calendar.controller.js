import * as calendarService from "../../services/admin/calendar.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
export const getReviewSchedules = asyncHandler(async (req, res) => {
    const schedules = await calendarService.getAllReviewSchedules();
    return new ApiResponse(200, { schedules }, "Review schedules retrieved successfully").send(res);
});
const assertCanManageSchedule = (req) => {
    const role = String(req.user?.role || "").toUpperCase();
    if (role !== "SUPERADMIN" && role !== "DEAN" && role !== "TEAMLEAD") {
        throw new ApiError(403, "Access Denied: Only the Team Lead, Dean, and Superadmin can create or manage schedules in the academic calendar.");
    }
};
export const createReviewSchedule = asyncHandler(async (req, res) => {
    assertCanManageSchedule(req);
    const { title, companyName, startDate, endDate, category, description } = req.body;
    if (!title || !startDate || !endDate) {
        throw new ApiError(400, "Title, start date, and end date are required.");
    }
    const schedule = await calendarService.createReviewSchedule({
        title,
        companyName: companyName || "Review Center Partner",
        startDate,
        endDate,
        category: category || "Board Review",
        description,
    });
    return new ApiResponse(201, { schedule }, "Review schedule created successfully").send(res);
});
export const updateReviewSchedule = asyncHandler(async (req, res) => {
    assertCanManageSchedule(req);
    const { id } = req.params;
    const schedule = await calendarService.updateReviewSchedule(id, req.body);
    return new ApiResponse(200, { schedule }, "Review schedule updated successfully").send(res);
});
export const deleteReviewSchedule = asyncHandler(async (req, res) => {
    assertCanManageSchedule(req);
    const { id } = req.params;
    await calendarService.deleteReviewSchedule(id);
    return new ApiResponse(200, {}, "Review schedule deleted successfully").send(res);
});
// ==========================================
// CALENDAR EVENTS (MONGODB DATABASE)
// ==========================================
export const getCalendarEvents = asyncHandler(async (req, res) => {
    const events = await calendarService.getAllCalendarEvents(req.user);
    return new ApiResponse(200, { events }, "Calendar events retrieved successfully").send(res);
});
export const getCalendarEventById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const event = await calendarService.getCalendarEventById(id);
    if (!event) {
        throw new ApiError(404, "Calendar event not found");
    }
    if (!calendarService.isUserEventAttendeeOrAuthor(event, req.user)) {
        throw new ApiError(403, "Access Denied: You are not an attendee of this calendar event.");
    }
    return new ApiResponse(200, { event }, "Calendar event retrieved successfully").send(res);
});
export const createCalendarEvent = asyncHandler(async (req, res) => {
    const { title, startDate, category } = req.body;
    if (!title || !startDate) {
        throw new ApiError(400, "Title and start date are required.");
    }
    const role = String(req.user?.role || "").toUpperCase();
    if (category === "Game Deadline" && role !== "SUPERADMIN" && role !== "DEAN" && role !== "TEAMLEAD") {
        throw new ApiError(403, "Access Denied: Only Superadmin, Dean, and Teamlead can set schedules with the Game Deadline category.");
    }
    const user = req.user;
    const authorName = user?.name ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "Admin User";
    const event = await calendarService.createCalendarEvent({
        ...req.body,
        authorId: user?.id,
        authorName: req.body.authorName || authorName,
        authorEmail: req.body.authorEmail || user?.email,
        createdBy: user?.id,
    });
    return new ApiResponse(201, { event }, "Calendar event created successfully").send(res);
});
export const updateCalendarEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const event = await calendarService.getCalendarEventById(id);
    if (!event) {
        throw new ApiError(404, "Calendar event not found");
    }
    const role = String(req.user?.role || "").toUpperCase();
    const userId = String(req.user?.id || "");
    const userEmail = String(req.user?.email || "").toLowerCase();
    const userName = String(req.user?.name || "").toLowerCase();
    const isStaff = role === "SUPERADMIN" || role === "DEAN" || role === "TEAMLEAD";
    const isGameDeadline = event.category === "Game Deadline" || req.body.category === "Game Deadline";
    if (isGameDeadline && !isStaff) {
        throw new ApiError(403, "Access Denied: Only Superadmin, Dean, and Teamlead can modify schedules with the Game Deadline category.");
    }
    const isAuthor = (event.authorId && String(event.authorId) === userId) ||
        (event.authorEmail && String(event.authorEmail).toLowerCase() === userEmail) ||
        (event.authorName && String(event.authorName).toLowerCase() === userName) ||
        (event.createdBy && String(event.createdBy) === userId);
    // For Game Deadline, any staff member (Superadmin, Dean, Teamlead) can update it
    if (!isGameDeadline && !isAuthor && role !== "SUPERADMIN") {
        throw new ApiError(403, "Access Denied: Only the author of this calendar event can modify it.");
    }
    const updated = await calendarService.updateCalendarEvent(id, req.body);
    return new ApiResponse(200, { event: updated }, "Calendar event updated successfully").send(res);
});
export const deleteCalendarEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const event = await calendarService.getCalendarEventById(id);
    if (!event) {
        throw new ApiError(404, "Calendar event not found");
    }
    const role = String(req.user?.role || "").toUpperCase();
    const userId = String(req.user?.id || "");
    const userEmail = String(req.user?.email || "").toLowerCase();
    const userName = String(req.user?.name || "").toLowerCase();
    const isStaff = role === "SUPERADMIN" || role === "DEAN" || role === "TEAMLEAD";
    const isGameDeadline = event.category === "Game Deadline";
    if (isGameDeadline && !isStaff) {
        throw new ApiError(403, "Access Denied: Only Superadmin, Dean, and Teamlead can delete Game Deadline schedules.");
    }
    const isAuthor = (event.authorId && String(event.authorId) === userId) ||
        (event.authorEmail && String(event.authorEmail).toLowerCase() === userEmail) ||
        (event.authorName && String(event.authorName).toLowerCase() === userName) ||
        (event.createdBy && String(event.createdBy) === userId);
    if (!isGameDeadline && !isAuthor && role !== "SUPERADMIN") {
        throw new ApiError(403, "Access Denied: Only the author of this calendar event can delete it.");
    }
    await calendarService.deleteCalendarEvent(id);
    return new ApiResponse(200, {}, "Calendar event deleted successfully").send(res);
});
