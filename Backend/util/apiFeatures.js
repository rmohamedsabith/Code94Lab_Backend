const { json } = require("express");

class apiFeatures{
    constructor(query,queryStr)
    {
        this.query=query,
        this.queryStr=queryStr,
        this.data=null
    }

    search()
    {
        let keyword=this.queryStr.keyword?{
            
                 $or:[
                    {name: { $regex: this.queryStr.keyword, $options: 'i' } },
                 ]
               
        }:{};

        this.query.find({...keyword})

        return this

    }

    paginate(resultperpage)
    {
        const currentPage=Number(this.queryStr.page)||1
        const skip=resultperpage*(currentPage-1)

        this.query.limit(resultperpage).skip(skip)
        return this
    }
    


}
module.exports=apiFeatures