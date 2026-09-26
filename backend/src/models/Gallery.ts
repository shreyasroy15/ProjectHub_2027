import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  title: { type: String }
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
