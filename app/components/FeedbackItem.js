import { useState } from "react";
import Popup from "../popup/Popup";
import { signIn, useSession } from "next-auth/react";
import Button from "../button/Button";
import axios from "axios";
import { MoonLoader } from "react-spinners";

export default function FeedbackItem({
  onOpen,
  _id,
  title,
  description,
  votes,
  onVotesChange,
}) {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isVotesLoading, setIsVotesLoading] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;

  function handleVote(e) {
    e.stopPropagation();
    e.preventDefault();
    if (!isLoggedIn) {
      localStorage.setItem("vote_after_login", _id);
      setShowLoginPopup(true);
    } else {
      setIsVotesLoading(true);
      axios.post("/api/vote", { feedbackId: _id }).then(async () => {
        await onVotesChange();
        setIsVotesLoading(false);
      });
    }
  }

  async function handleGoogleLogin(e) {
    e.stopPropagation();
    e.preventDefault();
    await signIn("google");
  }

  const iVoted = votes.find((v) => v.userEmail === session?.user?.email);

  const shortDesc = description.substring(0, 100);

  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
      className="flex items-center gap-8 my-8"
    >
      <div className="grow">
        <h2 className="font-bold">{title}</h2>
        <p className="text-gray-600 text-sm">
          {shortDesc}
          {shortDesc.length < description.length ? "..." : ""}
        </p>
      </div>
      <div>
        {showLoginPopup && (
          <Popup
            title={"Confirm your vote!"}
            narrow="true"
            setShow={setShowLoginPopup}
          >
            <div className="p-4">
              <Button onClick={handleGoogleLogin}>login with google</Button>
            </div>
          </Popup>
        )}
        <Button
          primary={iVoted ? "true" : ""}
          onClick={handleVote}
          className="shadow-md "
        >
          {!isVotesLoading && (
            <>
              <span className="triangle-up-arrow"></span>
              {votes?.length || "0"}
            </>
          )}
          {isVotesLoading && <MoonLoader size={18} />}
        </Button>
      </div>
    </a>
  );
}
