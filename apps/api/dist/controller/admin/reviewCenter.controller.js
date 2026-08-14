import * as reviewCenterService from "../../services/admin/reviewCenter.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";
export const getReviewCenters = asyncHandler(async (req, res) => {
    const { search, location, company } = req.query;
    const reviewCenters = await reviewCenterService.getAllReviewCenters({
        search: search,
        location: location,
        company: company,
    });
    return new ApiResponse(200, { reviewCenters }, "Review centers retrieved successfully").send(res);
});
export const getReviewCenterById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await reviewCenterService.getReviewCenterById(id);
    if (!item) {
        throw new ApiError(404, "Review center representative not found");
    }
    const { password, ...sanitized } = item;
    return new ApiResponse(200, { reviewCenter: sanitized }, "Review center retrieved successfully").send(res);
});
export const createReviewCenter = asyncHandler(async (req, res) => {
    const { name, email, companyName, phonenumber, employeeId, location, password } = req.body;
    if (!name || !email || !companyName) {
        throw new ApiError(400, "Name, email, and company name are required.");
    }
    const newRecord = await reviewCenterService.createReviewCenter({
        name,
        email,
        companyName,
        phonenumber: phonenumber || "",
        employeeId: employeeId || `RC-${Date.now().toString().slice(-4)}`,
        location: location || "Philippines",
        password,
    });
    const { password: _, ...sanitized } = newRecord;
    return new ApiResponse(201, { reviewCenter: sanitized }, "Review center created successfully").send(res);
});
export const updateReviewCenter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedRecord = await reviewCenterService.updateReviewCenter(id, req.body);
    const { password: _, ...sanitized } = updatedRecord;
    return new ApiResponse(200, { reviewCenter: sanitized }, "Review center updated successfully").send(res);
});
export const deleteReviewCenter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await reviewCenterService.deleteReviewCenter(id);
    return new ApiResponse(200, {}, "Review center deleted successfully").send(res);
});
