import mongoose, { mongo } from "mongoose";
import { lowercase, string } from "zod";
import { required } from "zod/mini";
import { User } from "./user.model.js";

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index:true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      //for slugify
      type: String,
       unique: true,
       lowercase: true,
      trim : true
    },
    description: {
      type: String,
      required: true,
    },
    technologies: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index :true
    },
    tags: [{
        type:String,
        index:true
    }],

    difficulty: {
      type: String,
    },
    githubLink: {
      type: String,
      required: true,
    },
    liveDemo: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    screenshots: [
      {
        type: String,
      },
    ],
    documents: {
      type: String,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

projectSchema.pre("save", function (next) {

    if (!this.isModified("title")) {
        return next();
    }

    this.slug = slugify(this.title, {
        lower: true,
        strict: true
    });

    next();
});

export const Project = mongoose.model("Project", projectSchema);
