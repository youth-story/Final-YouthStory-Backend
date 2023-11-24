const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
require('dotenv').config(); 
const {uploadNews, readNews, updateNews, deleteNews, toggleLikeNews, shareNews, commentNews, recentNews, topNews} = require('../helper/news');
const News = require('../models/News');
const Like = require('../models/Like');
const Review = require('../models/Reviews');

router.post('/upload', async(req, res) => {
    uploadNews(req, res, News, Like, Review, User);
});

router.get('/view/:id', async(req, res) => {
    readNews(req, res, News, Like, Review, User);
});

router.put('/update/:id', async(req, res) => {
    updateNews(req, res, News, Like, Review, User);
});

router.delete('/delete/:id', async(req, res) => {
    deleteNews(req, res, News, Like, Review, User);
});

router.post('/like/:id', async(req, res) => {
    toggleLikeNews(req, res, News, Like, Review, User);
});

router.get('/share/:id', async(req, res) => {
    shareNews(req, res, News, Like, Review, User);
});

router.post('/comment/:id', async(req, res) => {
    commentNews(req, res, News, Like, Review, User);
});

router.get('/recent', async(req, res) => {
    recentNews(req, res, News, Like, Review, User);
});

router.get('/top', async(req, res) => {
    topNews(req, res, News, Like, Review, User);
});

module.exports = router;