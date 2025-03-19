import mongoose from "mongoose";


const addressSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    fullName:{
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },    
    streetAddress:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    postalCode:{
        type: String,
        required: true
    }
},{
    timestamps: true
})


export default mongoose.model("Address", addressSchema);