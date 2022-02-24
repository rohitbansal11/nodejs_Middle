import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Articles = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  image: {
    type: String,
    required: [true, 'Please upload the image'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  isSticky: {
    type: Boolean,
    default: false,
  },
  author: {
    type: String,
    required: [true, 'Please add author name'],
  },
  date: {
    type: String,
    required: [true, 'Please add article date'],
  },
  time: {
    type: String,
    required: [true, 'Please add article time'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model('Article', Articles)
