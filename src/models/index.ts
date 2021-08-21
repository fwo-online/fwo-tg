import mongoose from 'mongoose';

// MONGO - полный mongo uri:
// "mongodb://user:password@db:27017/fwo?retryWrites=true&w=majority&authSource=admin 
mongoose.connect(
  process.env.MONGO,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
  },
).catch((e) => console.log(e));

export default mongoose;
