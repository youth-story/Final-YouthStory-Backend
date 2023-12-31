const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  likeableId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  likeableType: {
    type: String,
    enum: ['Article', 'Interviews', 'Post', 'News', 'Events', 'Magazine', 'Contests'],
    required: true
  },
  liked: {
    type: Boolean,
    default: false,
  }
});

const Like = mongoose.model('like', likeSchema);

module.exports = Like;
