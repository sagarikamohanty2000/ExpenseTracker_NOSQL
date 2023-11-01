 
const sequelize = require('../util/database');

const Expense = require('../models/expense');
const User = require('../models/Users');
const File = require('../models/fileData');
const s3Services = require('../services/s3service');

const postAddExpense = async (req,res,next)=>{
    
    const t = await sequelize.transaction();
    
    const amount = req.body.amt;
    const description = req.body.description;
    const category = req.body.category;
    const userId = req.user.id;
   try{
        await Expense.create({
        amount: amount,
        description: description,
        category: category,
        userId: userId,
        transaction: t
    })
            const expense = Number(req.user.totalExpense) + Number(amount);
            User.update({
                totalExpense: expense},
                {where: {id : userId}, 
                transaction: t
            }).then(async()=>{
                await t.commit();
                console.log("Expense updated");  
            })
            .catch(async (err) => {
                await t.rollback();
                console.log(err);
            })
            res.status(200).json({
            success: true,
            message:"Successfully added expense "
            })
   
   }
    catch(err) { 
        console.log(err)}
}

const getAllExpense = async (req,res,next) => {
   
    const showItem = Number(req.header('Showitem')) || 10;
    try {
        const page = +req.query.page || 1;
        const LIST_PER_PAGE =showItem;
        const expenses = await Expense.findAll({where : {userId : req.user.id},
            offset: (page-1) * LIST_PER_PAGE,
            limit: LIST_PER_PAGE
         })
        let totalItems = await Expense.count({where : {userId : req.user.id}});
        console.log("GET CALL");
        return res.status(200).json({
            expenseData: expenses,
            currentPage: page,
            hasNextPage: LIST_PER_PAGE*page < totalItems,
            nextPage: page + 1,
            hasPreviousPage: page - 1,
            lastPage: Math.ceil(totalItems/ LIST_PER_PAGE) 
    });
    }
    catch(err) { console.log(err)}
};

const deleteExpenseById = async (req,res,next) =>{
    
    const t = await sequelize.transaction();
    const exId = req.params.expenseId;
    if(exId == undefined || exId.length === 0)
    {      
            await t.rollback();
            res.status(400).json({
            error : {
            success: false,
            message:"No such item exists"
            }
        })
    }
    try{

        await Expense.destroy({where : {id:exId, userId: req.user.id}, transaction: t})
        console.log("DESTROYED EXPENSE");

            Expense.findAll({where: {id: exId}}).then((deleteExpenseInfo) => {
        
                const verifiedExpense = Number(req.user.totalExpense) - Number(deleteExpenseInfo[0].amount);
   
            User.update({
                totalExpense : verifiedExpense},
                 {where: {id : req.user.id}, 
                 transaction: t
                }).then(async()=>{
                    await t.commit();
                    console.log("totalExpense updated after Deletion");  
                })
                .catch(async (err) => {
                    await t.rollback();
                    console.log(err);
                })
        })
        .catch(async (err) => {
            await t.rollback();
            console.log(err);
        })
        res.status(200).json({
        success: true,
        message:"Successfully deleted "
})
    }
    catch(err){console.log(err)}
}

const downloadFile = async(req, res, next) => {

    const userId = req.user.id;
    const isPremium = Boolean(req.user.isPremium);
    try{
            if(isPremium === false)
            {
                return res.status(401).json({
                    error : {
                        success: false,
                        message: "Unauthorised" 
                    }
                })
            }
            else {
                const expenses = await req.user.getExpenses();
                console.log(expenses);
                const stringifiedExpenseData = JSON.stringify(expenses);
                const filename = `Expense${userId}/${new Date()}.text`;
                const fileUrl = await s3Services.uploadToS3(stringifiedExpenseData,filename);
                await File.create({
                    fileUrl: fileUrl,
                    userId: userId
                })
                res.status(200).json({
                    fileUrl, 
                    success : true,
                    message : "File download successful"
                })
            }
    }
    catch(err){
      console.log(err);
    }
}

const fileHistory = async(req, res,next) => {
    
    const isPremium = Boolean(req.user.isPremium);
    try {
        if(isPremium === true){
        const fileData = await File.findAll({where : {userId : req.user.id}})
            console.log("GET CALL");
            return res.status(200).json({
                fileData,
                success: true,
                message: "File data retrived"
            });
        }

        else
        {
            res.status(401).json({
                error:{
                    success: false,
                    message:"Unauthorised"
                }
            })
        }
        }
        catch(err) { console.log(err)}

}


module.exports = {
    postAddExpense,
    getAllExpense,
    deleteExpenseById,
    downloadFile,
    fileHistory
}