import { useState } from "react";
import Button from "../button/Button";
import AttachFiles from "./AttachFiles";
import Attachment from "./Attachment";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";

export default function CommentForm({ feedbackId, onPost }) {
  const [commentText, setCommentText] = useState("");
  const [uploads, setUploads] = useState([]);
  const { data: session } = useSession();

  function addNewUploads(newLinks) {
    setUploads((prevLinks) => [...prevLinks, ...newLinks]);
  }

  function removeUpload(e, linkToRemove) {
    e.preventDefault();
    e.stopPropagation();
    setUploads((prevLinks) =>
      prevLinks.filter((link) => link !== linkToRemove)
    );
  }

  async function submitComment(e) {
    e.preventDefault();
    const commentData = {
      text: commentText,
      uploads,
      feedbackId,
    };
    if (session) {
      await axios.post("/api/comment", commentData);
      setCommentText("");
      setUploads([]);
      onPost();
    } else {
      localStorage.setItem("comment_after_login", JSON.stringify(commentData));
      await signIn("google");
    }
  }

  return (
    <form>
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="border rounded-md w-full p-2"
        placeholder="Let us know what you think..."
      />
      {uploads?.length > 0 && (
        <div className="">
          <div className="text-sm text-gray-600 mb-2 mt-3">Files:</div>
          <div className="flex gap-3">
            {uploads.map((link, index) => (
              <div key={link._id}>
                <Attachment
                  link={link}
                  showDeleteIcon={true}
                  handleRemoveFile={(e, link) => removeUpload(e, link)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-3">
        <AttachFiles onNewFiles={addNewUploads} />
        <Button
          primary="true"
          disabled={commentText === ""}
          onClick={submitComment}
        >
          {session ? "Comment" : "Login and comment"}
        </Button>
      </div>
    </form>
  );
}
