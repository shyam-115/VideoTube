const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};

export default asyncHandler;
/*Calls your actual route/controller (e.g., registerUser, loginUser), 
 and wraps it in a Promise.resolve(...). This ensures even if the function throws an error 
(e.g., await fails), it's caught as a rejected promise.
If any error happens inside the requestHandler, it's passed to Express’s built-in error handler by calling next(error).
No need for manual try/catch in every route
*/
