import mongoose from "mongoose";
import { Feedback } from "../../models/Feedback";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Comment } from "../../models/Comment";

export async function POST(request) {
  const jsonBody = await request.json();
  const { title, description, uploads } = jsonBody;
  const mongoUrl = process.env.MONGO_URL;
  mongoose.connect(mongoUrl);
  const session = await getServerSession(authOptions);
  const userEmail = session.user.email;
  const FeedbackDoc = await Feedback.create({
    title,
    description,
    uploads,
    userEmail,
  });
  return Response.json(FeedbackDoc);
}

export async function PUT(request) {
  const jsonBody = await request.json();
  const { id, title, description, uploads } = jsonBody;
  const mongoUrl = process.env.MONGO_URL;
  mongoose.connect(mongoUrl);
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json(false);
  }
  const newFeedbackDoc = await Feedback.updateOne(
    { _id: id, userEmail: session.user.email },
    { title, description, uploads }
  );
  return Response.json(newFeedbackDoc);
}

export async function GET(request) {
  const mongoUrl = process.env.MONGO_URL;
  mongoose.connect(mongoUrl);
  const url = new URL(request.url);

  if (url.searchParams.get("id")) {
    return Response.json(await Feedback.findById(url.searchParams.get("id")));
  } else {
    const sortParam = url.searchParams.get("sort");
    const loadedRows = url.searchParams.get("loadedRows");
    const searchPhrase = url.searchParams.get("search");
    let sortDef;
    if (sortParam === "latest") {
      sortDef = { createdAt: -1 };
    }
    if (sortParam === "oldest") {
      sortDef = { createdAt: 1 };
    }

    if (sortParam === "votes") {
      sortDef = { votesCountCashed: -1 };
    }

    let filter = null;
    if (searchPhrase) {
      const comments = await Comment.find(
        {
          text: { $regex: ".*" + searchPhrase + ".*" },
        },
        "feedbackId",
        {
          limit: 20,
        }
      );
      filter = {
        $or: [
          { title: { $regex: ".*" + searchPhrase + ".*" } },
          { description: { $regex: ".*" + searchPhrase + ".*" } },
          { _id: comments.map((c) => c.feedbackId) },
        ],
      };
    }

    return Response.json(
      await Feedback.find(filter, null, {
        sort: sortDef,
        skip: loadedRows,
        limit: 10,
      }).populate("user")
    );
  }
}
