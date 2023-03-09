const asyncWrapper = async (fn) => {

    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            nextDay(error);
        }
    }
}

module.exports = asyncWrapper;