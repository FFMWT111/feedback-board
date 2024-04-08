import { useState } from "react";
import Button from "../button/Button";
import Popup from "./Popup";
import axios from "axios";

import Attachment from "../components/Attachment";
import AttachFiles from "../components/AttachFiles";
import { signIn, useSession } from "next-auth/react";

export default function FeedbakcModal({ setShow, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploads, setUploads] = useState([]);
  const { data: session } = useSession();

  async function handleCreatePost(e) {
    e.preventDefault();
    if (session) {
      axios.post("/api/feedback", { title, description, uploads }).then(() => {
        setShow(false);
        onCreate();
      });
    } else {
      localStorage.setItem(
        "post_after_login",
        JSON.stringify({ title, description, uploads })
      );
      await signIn("google");
    }
  }

  function handleRemoveFile(e, link) {
    e.preventDefault();
    setUploads((prevUploads) => {
      return prevUploads.filter((val) => val !== link);
    });
  }

  function addNewUploads(newLinks) {
    setUploads((prevLinks) => [...prevLinks, ...newLinks]);
  }

  return (
    <div>
      <Popup setShow={setShow} title={"Make a suggestion"}>
        <form className="p-8">
          <label className="block mt-4 mb-1 text-slate-700">Title</label>
          <input
            type="text"
            placeholder="A short,descriptive title"
            multiple={true}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
          <label className="block mt-4 mb-1 text-slate-700">Details</label>
          <textarea
            placeholder="Please include any details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-2 h-24"
          ></textarea>
          {uploads?.length > 0 && (
            <div>
              <label className="block mt-2 mb-1 text-slate-700">Files</label>
              <div className="flex items-center gap-3">
                {uploads.map((link) => [
                  <Attachment
                    key={link._id}
                    link={link}
                    showDeleteIcon={true}
                    handleRemoveFile={(e, link) => handleRemoveFile(e, link)}
                  />,
                ])}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3">
            <AttachFiles onNewFiles={addNewUploads} />
            <Button primary="true" onClick={handleCreatePost}>
              {session ? "Create post" : "Login and post"}
            </Button>
          </div>
        </form>
      </Popup>
    </div>
  );
}
