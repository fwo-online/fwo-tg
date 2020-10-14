import mongoose from 'mongoose';

mongoose.connect(
  'mongodb://root:fworootpassword@db:27017/fwo?retryWrites=true&w=majority&authSource=admin',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
  },
).catch((e) => console.log(e));

export default mongoose;
