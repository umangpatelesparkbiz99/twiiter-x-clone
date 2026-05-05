class ExpressError extends Error{
    statusCode: any;
    
    constructor(statusCode: any,message: string) {
            super();
            this.statusCode = statusCode;
            this.message = message;
    }
}

export default ExpressError;