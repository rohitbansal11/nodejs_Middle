import Article from '../../models/Article.js'
import asyncHandler from 'express-async-handler'
import ErrorResponse from '../../utils/errorResponse.js'

// @desc        Get all article
// @route       GET   /api/v1/article-admin
// @access      Public
export const getArticles = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc        Get single article
// @route       GET   /api/v1/article-admin/:id
// @access      Public
export const getArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id)
  if (!article) {
    return next(new ErrorResponse(`Article Not Found`, 404))
  }
  res.status(200).json({
    success: true,
    data: article,
  })
})

// @desc        Create article
// @route       POST   /api/v1/article-admin/
// @access      Private/Admin
export const createArticle = asyncHandler(async (req, res, next) => {
  const { title, description, image, category, isSticky, author, date, time } =
    req.body

  const article = await Article.create({
    title,
    description,
    image,
    category,
    isSticky,
    author,
    date,
    time,
  })

  res.status(201).json({
    success: true,
    data: article,
  })
})

// @desc        Update article
// @route       PUT   /api/v1/article/:id
// @access      Private/Admin
export const updateArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!article) {
    return next(new ErrorResponse(`Article Not Found`, 404))
  }
  res.status(200).json({
    success: true,
    data: article,
  })
})

// @desc        delete article
// @route       Delete   /api/v1/article-admin/:id
// @access      Private/Admin
export const deleteArticle = asyncHandler(async (req, res, next) => {
  await Article.findByIdAndRemove(req.params.id)
  res.status(200).json({
    success: true,
    msg: 'Article Removed',
    data: {},
  })
})
