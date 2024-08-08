const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema

const ProductSchema = new Schema({
    name: {
        type: String,
    },
    category: {
        type: String,
    },
    price: {
        type: Number,
    },
    contact: {
        type: String,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    date: {
        type: Date,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})


module.exports = mongoose.model('Product', ProductSchema)