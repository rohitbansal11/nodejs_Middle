import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import colors from 'colors'
import fileupload from 'express-fileupload'
import cookieParser from 'cookie-parser'
import sanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import cors from 'cors'

// Imports //
import connectDB from './config/db.js'
import errorHandler from './middlewares/errorMiddleware.js'

// import routes //
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import articleRoutes from './routes/ArticleRoutes/articleRoutes.js'
import articleAdminRoutes from './routes/ArticleRoutes/articleAdminRoutes.js'
import bareActRoutes from './routes/BareActRoutes/bareActRoutes.js'
import bareActAdminRoutes from './routes/BareActRoutes/bareActAdminRoutes.js'
import legalTermRoutes from './routes/LegalTermRoutes/legalTermRoutes.js'
import legalTermAdminRoutes from './routes/LegalTermRoutes/legalTermAdminRoutes.js'
import legalLandmarkRoutes from './routes/LegalLandmarkRoutes/legalLandmarkRoutes.js'
import legalLandmarkAdminRoutes from './routes/LegalLandmarkRoutes/legalLandmarkAdminRoutes.js'
import stickyArticleRoutes from './routes/Sticky/stickyArticleRoutes.js'
import stickyLandmarkRoutes from './routes/Sticky/stickyLandmarkRoutes.js'
import wishlistBareActRoutes from './routes/Wishlist/wishlistBareActRoutes.js'
import wishlistLegaltermRoutes from './routes/Wishlist/wishlistLegaltermRoutes.js'
import PYQAdminRoutes from './routes/PYQ/PYQAdminRoutes.js'
import MCQAdminRoutes from './routes/MCQ/MCQAdminRoutes.js'
import PYQRoutes from './routes/PYQ/PYQRoutes.js'
import MCQRoutes from './routes/MCQ/MCQRoutes.js'
import MockTestAdminRoutes from './routes/MockTest/MockTestAdminRoutes.js'
import MockTestRoutes from './routes/MockTest/MockTestRoutes.js'
import DictionaryAdminRoutes from './routes/DictionaryRoutes/dictionaryAdminRoutes.js'
import DictionaryRoutes from './routes/DictionaryRoutes/dictionaryRoutes.js'
import WordOfDay from './routes/WordOfDay/wordOfDayRoutes.js'
import WordOfDayAdminRoutes from './routes/WordOfDay/wordOfDayAdminRoutes.js'
import studentTestResult from './routes/StudentTestResultRoutes/studentTestResultRoutes.js'

// Load env vars //
dotenv.config({ path: './config/config.env' })

const app = express()
connectDB()

// Middleware //
app.use(helmet())
// rate limiting //
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
})
app.use(limiter)
// prevent http param polution //
app.use(hpp())
// cross domain access //
app.use(cors())
// sanitize data //
app.use(sanitize())
// prevent cross site scripting attack //
// app.use(xss())

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
// accept json data //
app.use(express.json({ extended: false }))
// file uploading //
app.use(fileupload())
// cookie parser //
app.use(cookieParser())
// set static folder //
// app.use(express.static(path.join(__dirname, 'public')))

// Routes //
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/admin', userRoutes)
app.use('/api/v1/article', articleRoutes)
app.use('/api/v1/article-admin', articleAdminRoutes)
app.use('/api/v1/bare-act', bareActRoutes)
app.use('/api/v1/bare-act-admin', bareActAdminRoutes)
app.use('/api/v1/legal-term', legalTermRoutes)
app.use('/api/v1/legal-term-admin', legalTermAdminRoutes)
app.use('/api/v1/legal-landmark', legalLandmarkRoutes)
app.use('/api/v1/legal-landmark-admin', legalLandmarkAdminRoutes)
app.use('/api/v1/sticky/article', stickyArticleRoutes)
app.use('/api/v1/sticky/landmark', stickyLandmarkRoutes)
app.use('/api/v1/wishlist/bare-act', wishlistBareActRoutes)
app.use('/api/v1/wishlist/legal-term', wishlistLegaltermRoutes)
app.use('/api/v1/admin/pyq', PYQAdminRoutes)
app.use('/api/v1/admin/mcq', MCQAdminRoutes)
app.use('/api/v1/pyq', PYQRoutes)
app.use('/api/v1/mcq', MCQRoutes)
app.use('/api/v1/admin/mocktest', MockTestAdminRoutes)
app.use('/api/v1/mocktest', MockTestRoutes)
app.use('/api/v1/admin/dictionary', DictionaryAdminRoutes)
app.use('/api/v1/dictionary', DictionaryRoutes)
app.use('/api/v1/word-of-day', WordOfDay)
app.use('/api/v1/admin/word-of-day', WordOfDayAdminRoutes)
app.use('/api/v1/student-test-result', studentTestResult)
// error handlers //
app.use(errorHandler)

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port: ${PORT}`.yellow
      .bold
  )
})

// Handle unhandled promise rejections //
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold)
  // Close server & exit process //
  server.close(() => process.exit(1))
})
