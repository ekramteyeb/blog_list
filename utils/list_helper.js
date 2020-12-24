// eslint-disable-next-line no-unused-vars
const dummy = blogs => {
  return 1
}

const totalLikes = blogPosts => {
  return  blogPosts.reduce((a,b) => a + b.likes, 0)
}

// returns blog with maximum likes
const favoriteBlog = blogs => {
  if(blogs.length === 0)
    return {}
  let max = blogs[0].likes
  let favIndex = 0
  for (let index = 0; index < blogs.length; index++) {
    if(blogs[index].likes > max) {
      max = blogs[index].likes
      favIndex = index
    }
  }
  const { title, author , likes } = blogs[favIndex]
  return { title, author, likes }

}

//returns author/s with large amout of blogs
const mostBlogs = blogs => {
  if(blogs.length === 0)
    return {}
  let allAuthors = []
  blogs.forEach( blog => {
    allAuthors.push(blog.author)
  })

  let authorWithBlogsCount = []
  const authorsSet = new Set(allAuthors)

  for (const author of authorsSet) {
    let blogs =  allAuthors.filter(a => a === author).length
    authorWithBlogsCount.push({
      author,
      blogs
    })
  }
  //sort with blogs count descending order and pick the top one
  authorWithBlogsCount = authorWithBlogsCount.sort((a,b) => {
    if(a.blogs > b.blogs) return -1
    if(a.blogs < b.blogs) return 1
    return 0
  })

  return authorWithBlogsCount[0]
}
//returns author/s with maximum amout of likes for his/her/thier blogs
const mostLikes = blogs => {
  if(blogs.length === 0)
    return {}
  let allAuthors = []
  blogs.forEach( blog => {
    allAuthors.push(blog.author)
  })

  let authorWithBlogsLikes = []
  const authorsSet = new Set(allAuthors)

  for (const author of authorsSet) {
    let likes =  blogs.filter(blog => blog.author === author).reduce((a,b) => a + b.likes,0)
    authorWithBlogsLikes.push({
      author,
      likes
    })
  }
  //sort with blogs count descending order and pick the top one
  authorWithBlogsLikes = authorWithBlogsLikes.sort((a,b) => {
    if(a.likes > b.likes) return -1
    if(a.likes < b.likes) return 1
    return 0
  })

  return authorWithBlogsLikes[0]
}
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}



/* const blogs = [
  { _id: '5a422a851b54a676234d17f7', title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7, __v: 0 },
  { _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', likes: 5, __v: 0 },
  { _id: '5a422b3a1b54a676234d17f9', title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', likes: 12, __v: 0 },
  { _id: '5a422b891b54a676234d17fa', title: 'First class tests', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll', likes: 10, __v: 0 },
  { _id: '5a422ba71b54a676234d17fb', title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', likes: 0, __v: 0 },
  { _id: '5a422bc61b54a676234d17fc', title: 'Type wars', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html', likes: 2, __v: 0 }
]

console.log(mostLikes(blogs)) */