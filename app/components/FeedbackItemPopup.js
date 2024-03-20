"use client";
import { MoonLoader } from "react-spinners";
import Button from "../button/Button";
import Popup from "../popup/Popup";
import FeedbackItemCommentsPopup from "./FeedbackItemCommentsPopup";
import axios from "axios";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Attachment from "./Attachment";
import AttachFiles from "./AttachFiles";

export default function FeedbackItemPopup({
  setShow,
  title,
  description,
  votes,
  _id,
  onVotesChange,
  uploads,
  user,
  onUpdate,
}) {
  const [isVotesLoading, setIsVotesLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState();
  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description);
  const [newUploads, setNewUploads] = useState(uploads);
  const { data: session } = useSession();

  function handleVote() {
    setIsVotesLoading(true);
    axios.post("/api/vote", { feedbackId: _id }).then(async () => {
      await onVotesChange();
      setIsVotesLoading(false);
    });
  }

  function handleEdit() {
    setIsEditMode(true);
  }

  function handleRemoveFile(e, linkToRemove) {
    e.preventDefault();
    setNewDescription((prevNewUploads) =>
      prevNewUploads.filter((l) => l !== linkToRemove)
    );
  }

  function handleCancel() {
    setIsEditMode(false);
    setNewTitle(title);
    setNewDescription(description);
    setNewUploads(uploads);
  }

  function handleNewUploads(newLinks) {
    setNewUploads((prevUploads) => [...prevUploads, ...newLinks]);
  }

  function handleSave() {
    axios
      .put("/api/feedback", {
        id: _id,
        title: newTitle,
        description: newDescription,
        uploads: newUploads,
      })
      .then(() => {
        setIsEditMode(false);
        onUpdate({
          title: newTitle,
          description: newDescription,
          uploads: newUploads,
        });
      });
  }

  const iVoted = votes.find((v) => v.userEmail === session?.user?.email);

  return (
    <Popup title={""} setShow={setShow}>
      <div className="p-8 pb-2">
        {isEditMode && (
          <input
            className="block border rounded-md w-full mb-1 p-2"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        )}
        {!isEditMode && <h2 className="text-lg font-bold mb-2">{title}</h2>}
        {isEditMode && (
          <textarea
            className="block border rounded-md w-full p-2"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        )}
        {!isEditMode && (
          <p
            className="text-gray-600"
            dangerouslySetInnerHTML={{
              __html: description.replace(/\n/gi, "<br />"),
            }}
          />
        )}
        {uploads?.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-slate-500">Attachments:</span>
            <div className="flex gap-2 mt-1">
              {(isEditMode ? newUploads : uploads).map((link, index) => (
                <Attachment
                  key={index._id}
                  link={link}
                  showRemoveButton={isEditMode}
                  handleRemoveFile={handleRemoveFile}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end px-8 py-3 border-b">
        {isEditMode && (
          <>
            <AttachFiles onNewFiles={handleNewUploads} />
            <Button onClick={handleCancel}>
              <TrashIcon className="w-4 h-4" />
              Cancel
            </Button>
            <Button primary="true" onClick={handleSave}>
              Save changes
            </Button>
          </>
        )}
        {!isEditMode && user?.email && session?.user?.email === user?.email && (
          <Button onClick={handleEdit}>
            <PencilSquareIcon className="w-4 h-4" />
            Edit
          </Button>
        )}
        {!isEditMode && (
          <Button primary="true" onClick={handleVote}>
            {isVotesLoading && <MoonLoader size={18} />}
            {!isVotesLoading && (
              <>
                {iVoted && (
                  <>
                    <CheckCircleIcon className="w-6 h-6" />
                    Upvoted {votes?.length || "0"}
                  </>
                )}
                {!iVoted && (
                  <>
                    <span className="triangle-up-arrow"></span>
                    Upvote {votes?.length || "0"}
                  </>
                )}
              </>
            )}
          </Button>
        )}
      </div>
      <div>
        <FeedbackItemCommentsPopup feedbackId={_id} />
      </div>
    </Popup>
  );
}
