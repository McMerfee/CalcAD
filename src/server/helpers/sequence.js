import { SequenceCounters } from '../db';

// eslint-disable-next-line
export const getNextSequence = async (sequenceName) => {
  const doc = await SequenceCounters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { nextSequence: 1 } },
    { new: true, upsert: true },
  ).lean();

  return doc.nextSequence;
};
