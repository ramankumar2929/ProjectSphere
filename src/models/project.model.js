import mongoose, { mongo, trusted } from "mongoose";
import { lowercase, string } from "zod";
import { required } from "zod/mini";
import { User } from "./user.model.js";
import slugify from "slugify";
const projectSchema = new mongoose.Schema(
  {
    ownername: {
      type: String,
      required: true,
    },
    ownerid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
      trim: true,
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
      index: true,
    },
    tags: [
      {
        type: String,
        index: true,
      },
    ],

    difficulty: {
      type: String,
    },
    githublink: {
      type: String,
      required: true,
    },
    liveDemo: {
      type: String,
    },
    thumbnail: {
       url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        resource_type: {
          type: String,
          required: true,
        },
    },
    screenshots: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        resource_type: {
          type: String,
          required: true,
        },
      },
    ],

    documents: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        resource_type: {
          type: String,
          required: true,
        },
      },
    ],
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
    return next;
  }

  this.slug = slugify(this.title, {
    lower: true,
    strict: true,
  });

  next;
});

export const Project = mongoose.model("Project", projectSchema);
