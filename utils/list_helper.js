var _ = require('lodash')

const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  const totalLikes = blogs.reduce((sum, blog) => sum + blog.likes, 0)
  return totalLikes
}

const favoriteBlog = blogs => {
  let max = 0
  let mostLikedBlog

  blogs.forEach(blog => {
    if (blog.likes > max){
      mostLikedBlog = blog
      max = blog.likes
    }
  })

  const temp = {
    title: mostLikedBlog.title,
    author: mostLikedBlog.author,
    likes: mostLikedBlog.likes
  }
  return temp
}

const mostBlogs = blogs => {

  let temp = _.countBy(blogs, blog => blog.author)
  let authorBlogs = 0
  let author

  _.forIn(temp, (value, key) => {
    if (authorBlogs < value){
      author = key
      authorBlogs = value
    }
  })

  const blogAmount = {
    author: author,
    blogs: authorBlogs
  }
  return blogAmount
}

const mostLikes = blogs => {

  let max = 0
  let tempMax
  let mostLikedAuthor

  let temp = _.groupBy(blogs, 'author')

  _.forIn(temp, (value, key) => {
    tempMax = 0
    _.mapValues(value, blog => {
      tempMax += blog.likes
    })
    if(tempMax > max){
      max = tempMax
      mostLikedAuthor = {
        author: key,
        likes: max
      }
    }
  })
  return mostLikedAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}