module.exports =(fn) => {
    return (req,res,next) =>{
        fn(req,res,next).catch(next);
        //Async Route → Error → catch(next) → next(err) → Error Middleware
    }
}