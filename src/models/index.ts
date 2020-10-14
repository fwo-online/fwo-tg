import mongoose from 'mongoose';

mongoose.connect(
  'mongodb+srv://root:fworootpassword@db/fwogame?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
  },
).catch((e) => console.log(e));

export default mongoose;
