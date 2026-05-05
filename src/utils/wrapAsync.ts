export const wrapAsync = (fn: Function) => {
    return function (req: any, res: any, next: any) {
        fn(req, res, next).catch(next);
    }   
};