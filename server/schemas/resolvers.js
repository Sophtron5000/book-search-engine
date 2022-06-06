const { TokenExpiredError } = require('jsonwebtoken');
const { User } = require('../models');
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, { _id }) => {
            return await User.findOne({_id: _id});
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({username, email, password});
            const token = singleToken(user);
            return { token, user };
          },
        login: async (parent, {email, password}) => {
            const userLogin = await User.findOne({email: email})
            if (!userLogin){
                throw new Error({
                    message: "No user by that email"
                })
            }
            const isCorrect = await User.isCorrectPassword(password)
            if (!isCorrect){
                throw new Error({
                    message: "Password incorrect"
                })
            }
            const userToken = signToken(userLogin)
            return { userToken, userLogin }
        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
              const bookList = await User.findByIdAndUpdate({
                user: context.user._id
              },
              {
                $push: { savedBooks: bookData }
              },
              {
                new: true
              }
              );
              return bookList;
            }
            throw new AuthenticationError('Book not saved!');
          },
        // get book data and user id, then use findByIdAndUpdate(bookData: User) $push<=research

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const bookList = await User.findByIdAndUpdate({
                    user: context.user._id
                },
                {
                    $pull: { savedBooks: bookId }
                },
                {
                    new: true
                  }
                 );
                  return bookList;
                }
                throw new AuthenticationError('Book not saved!');
        }
        // get bookId abd userId, use findByIdAndUpdate(User: _id, Book: bookId) $pull<=research
    }
}

module.exports = resolvers