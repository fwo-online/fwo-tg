import mongoose, { Schema } from 'mongoose';

export const schema = new Schema({
  type: { type: String },
  seq: { type: Number, default: 0 },
});

export const CounterModel = mongoose.model('Counters', schema);
