const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    }
    catch (error) {
        const err = error;
        const statusCode = err.statusCode ?? 500;
        res.status(statusCode).json({
            success: err.success || false,
            message: err.message || "Internal Server Error",
            errors: err.errors || [],
            data: err.data || null,
            name: err.name || "No Name",
            stack: err.stack || "Empty Stack",
        });
    }
};
export { asyncHandler };
