const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LİMİT = 0; //if we define 0,mongo.db understand limitless so there is no limit 

function getPagination (query){
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;   //query.page is string.I want convert this a number.so use Math.abs function
    const limit = Math.abs(query.limit)|| DEFAULT_PAGE_LİMİT;    
    const skip = (page - 1) * limit

    return {
        skip,
        limit,
    }
}   

module.exports = {
    getPagination,
};