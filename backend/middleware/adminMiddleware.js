const admin = (req,res,next)=>{
    if(req.user && req.user.role === 'admin'){
     return next();
    }else{
        res.status(403).json({message:'Access denied, admin only'});
    }
};

module.exports = {admin}