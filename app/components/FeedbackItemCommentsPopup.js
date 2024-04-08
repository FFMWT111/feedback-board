import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import CommentForm from "./FeedbackItemCommentFormPopup";
import axios from "axios";
import Attachment from "./Attachment";
import TimeAgo from "timeago-react"; // var TimeAgo = require('timeago-react');
import { useSession } from "next-auth/react";
import AttachFiles from "./AttachFiles";

export default function FeedbackItemCommentsPopup({ feedbackId }) {
  const [comments, setComments] = useState([]);
  const [edittingComment, setEdittingComment] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentUploads, setNewCommentUploads] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    fetchComments();
  }, []);

  function fetchComments() {
    axios.get("/api/comment?feedbackId=" + feedbackId).then((res) => {
      setComments(res.data);
    });
  }

  function handleEditButtonInComment(comment) {
    console.log(comment);
    setEdittingComment(comment);
    setNewCommentText(comment.text);
    setNewCommentUploads(comment.uploads);
  }

  function handleCancelButtonInComment() {
    setEdittingComment(null);
    setNewCommentText("");
    setNewCommentUploads([]);
  }

  async function handleSaveButtonInComment() {
    const newData = { text: newCommentText, uploads: newCommentUploads };
    await axios.put("/api/comment", { id: edittingComment._id, ...newData });
    setComments((existingComments) => {
      return existingComments.map((comment) => {
        if (comment._id === edittingComment._id) {
          return { ...comment, ...newData };
        } else {
          return comment;
        }
      });
    });
    setEdittingComment(null);
  }

  function handleRemoveFileButton(e, linkToRemove) {
    e.preventDefault();
    setNewCommentUploads((prev) => prev.filter((l) => l !== linkToRemove));
  }

  function handleNewLinks(newLinks) {
    setNewCommentUploads((currentLinks) => [...currentLinks, ...newLinks]);
  }

  return (
    <div className="p-8">
      {comments?.length > 0 &&
        comments.map((comment, index) => {
          const edittingThings = edittingComment?._id === comment._id;
          const isAuthor =
            !!comment?.user?.email &&
            comment?.user?.email === session?.user?.email;
          return (
            <div key={index} className="flex gap-4 mb-8">
              <Avatar url={comment?.user?.image} />
              <div>
                {edittingThings && (
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="border p-2 block w-full"
                  />
                )}
                {!edittingThings && (
                  <p className="text-gray-600">{comment.text}</p>
                )}
                {(edittingThings ? newCommentUploads : comment.uploads)
                  ?.length > 0 && (
                  <div className="flex gap-2">
                    {(edittingThings ? newCommentUploads : comment.uploads).map(
                      (link, index) => (
                        <Attachment
                          key={link._id}
                          link={link}
                          handleRemoveFileButton={handleRemoveFileButton}
                          showRemoveButton={
                            edittingComment?._id === comment._id
                          }
                        />
                      )
                    )}
                  </div>
                )}
                <div className="text-gray-400 text-sm mt-2">
                  {comment?.user?.name} &nbsp;&middot;&nbsp;
                  <TimeAgo datetime={comment.createdAt} locale="en_UK" />
                  {!edittingThings && isAuthor && (
                    <>
                      &nbsp;&middot;&nbsp;
                      <span
                        onClick={() => handleEditButtonInComment(comment)}
                        className="cursor-pointer hover:underline"
                      >
                        Edit
                      </span>
                    </>
                  )}
                  {edittingThings && (
                    <>
                      &nbsp;&middot;&nbsp;
                      <span
                        onClick={handleCancelButtonInComment}
                        className="cursor-pointer hover:underline"
                      >
                        Cancel
                      </span>
                      &nbsp;&middot;&nbsp;
                      <span
                        onClick={handleSaveButtonInComment}
                        className="cursor-pointer hover:underline"
                      >
                        Save changes
                      </span>
                    </>
                  )}
                </div>
                {edittingThings && <AttachFiles onNewFiles={handleNewLinks} />}
              </div>
            </div>
          );
        })}
      {!edittingComment && (
        <CommentForm feedbackId={feedbackId} onPost={fetchComments} />
      )}
    </div>
  );
}
