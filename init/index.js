const mongoose = require("mongoose")
const initData = require("./data");
const Listing = require("../models/listing")
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
main()
.then(()=>
    {console.log("database is connected")}
)
.catch(err => console.log(err));


const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"68591f9824223794a3e47b05"}))
    await Listing.insertMany(initData.data);

    console.log("data was initialized")
}
initDB();

