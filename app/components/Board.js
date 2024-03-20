"use client";
import axios from "axios";
import debounce from "lodash.debounce";
import { useEffect, useRef, useState } from "react";
import FeedbackItem from "./FeedbackItem";
import FeedbakcModal from "../popup/FeedbackModal";
import { useSession } from "next-auth/react";
import Button from "../button/Button";
import FeedbackItemPopup from "./FeedbackItemPopup";
import { MoonLoader } from "react-spinners";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Board() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFeedbackItemPopup, setShowFeedbackItemPopup] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const fetchingFeedbacksRef = useRef(false);
  const [fetchingFeedbacks, setFetchingFeedbacks] = useState(false);

  const waitingRef = useRef(false);
  const [waiting, setWaiting] = useState(false);

  const [votesLoading, setVotesLoading] = useState(false);
  const [votes, setVotes] = useState([]);
  const [sort, setSort] = useState("votes");
  const [searchPhrase, setSearchPhrase] = useState("");
  const searchPhraseRef = useRef("");
  const debouncedFetchFeedbacksRef = useRef(debounce(fetchFeedbacks, 300));

  const sortRef = useRef("votes");
  const loadedRows = useRef(0);
  const everythingLoadedRef = useRef(false);

  const { data: session } = useSession();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    fetchVotes();
  }, [feedbacks]);

  useEffect(() => {
    loadedRows.current = 0;
    sortRef.current = sort;
    searchPhraseRef.current = searchPhrase;
    everythingLoadedRef.current = false;

    if (feedbacks?.length < 1) {
      setFeedbacks([]);
    }

    setWaiting(true);
    waitingRef.current = true;
    // setFetchingFeedbacks(true);
    // fetchingFeedbacksRef.current = true;
    debouncedFetchFeedbacksRef.current();
  }, [sort, searchPhrase]);

  useEffect(() => {
    if (session?.user?.email) {
      const feedbackToVote = localStorage.getItem("vote_after_login");
      if (feedbackToVote) {
        axios.post("/api/vote", { feedbackId: feedbackToVote });
        localStorage.removeItem("vote_after_login");
        fetchVotes();
      }

      const feedbackToPost = localStorage.getItem("post_after_login");
      if (feedbackToPost) {
        const feedbackData = JSON.parse(feedbackToPost);
        axios.post("/api/feedback", feedbackData).then(async (res) => {
          setShowFeedbackItemPopup(res.data);
          localStorage.removeItem("post_after_login");
          await fetchFeedbacks();
        });
      }

      const commentToPost = localStorage.getItem("comment_after_login");
      if (commentToPost) {
        const commentData = JSON.parse(commentToPost);
        axios.post("/api/comment", commentData).then(() => {
          axios
            .get("/api/feedback?id=" + commentData.feedbackId)
            .then((res) => {
              setShowFeedbackItemPopup(res.data);
              localStorage.removeItem("comment_after_login");
            });
        });
      }
    }
  }, [session?.user?.email]);

  function handleScroll() {
    const html = window.document.querySelector("html");
    const scrollTop = html.scrollTop;
    const scrollHeight = html.scrollHeight;
    const leftScroll = scrollHeight - scrollTop - html.clientHeight;
    if (leftScroll <= 100) {
      fetchFeedbacks(true);
    }
  }

  function registerScrollListener() {
    window.document
      // .querySelector("html")
      .addEventListener("scroll", handleScroll);
  }

  function unregisterScrollListener() {
    window.document
      // .querySelector("html")
      .removeEventListener("scroll", handleScroll);
  }

  useEffect(() => {
    registerScrollListener();
    return () => {
      unregisterScrollListener();
    };
  }, []);

  useEffect(() => {
    registerScrollListener();
  }, []);

  async function fetchFeedbacks(append = false) {
    if (fetchingFeedbacks.current) return;
    if (everythingLoadedRef.current) return;
    fetchingFeedbacksRef.current = true;
    setFetchingFeedbacks(true);
    axios
      .get(
        `/api/feedback?sort=${sortRef.current}&loadedRows=${loadedRows.current}&search=${searchPhraseRef.current}`
      )
      .then((res) => {
        if (append) {
          setFeedbacks((currentFeedbacks) => [
            ...currentFeedbacks,
            ...res.data,
          ]);
        } else {
          setFeedbacks(res.data);
        }
        if (res.data?.length > 0) {
          loadedRows.current += res.data.length;
        }
        if (res.data?.length === 0) {
          everythingLoadedRef.current = true;
        }
        fetchingFeedbacksRef.current = false;
        setFetchingFeedbacks(false);
        waitingRef.current = false;
        setWaiting(false);
      });
  }

  async function fetchVotes() {
    setVotesLoading(true);
    const ids = feedbacks.map((f) => f._id);
    const res = await axios.get(`/api/vote?feedbackIds=` + ids.join(","));
    setVotes(res.data);
    setVotesLoading(false);
  }

  function openFeedbackModal() {
    setShowFeedbackModal(true);
  }

  function openFeedbackItemPopup(feedback) {
    setShowFeedbackItemPopup(feedback);
  }

  async function handleFeedbackUpdate(newData) {
    setShowFeedbackItemPopup((prevData) => {
      return { ...prevData, ...newData };
    });
    await fetchFeedbacks();
  }

  return (
    <main className="bg-white mx-auto overflow-hidden md:shadow-lg md:max-w-2xl md:rounded-lg md:mt-4 md:mb-8">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-400 p-8">
        <h1 className="font-semibold text-xl">Coding Anywhere</h1>
        <p className="text-opacity-90 text-slate-700">
          Help me decide what should i build next
        </p>
      </div>
      <div className="flex items-center bg-gray-100 px-8 py-2 border-b">
        <div className="grow flex items-center gap-4 text-gray-400">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
            }}
            className="bg-transparent py-1"
          >
            <option value="votes">Most voted</option>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-3 left-2 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="bg-transparent p-2 pl-7"
            />
          </div>
        </div>
        <div>
          <Button primary="true" onClick={openFeedbackModal}>
            Make a suggestion
          </Button>
        </div>
      </div>
      <div className="px-8">
        {feedbacks?.length === 0 && !fetchingFeedbacks && !waiting && (
          <div className="text-center text-2xl text-gray-200 p-4">
            Nothing found :(
          </div>
        )}
        {feedbacks.map((feedback, index) => (
          <FeedbackItem
            key={index._id}
            title={feedback.title}
            description={feedback.description}
            _id={feedback._id}
            votes={votes.filter((v) => v.feedbackId === feedback._id)}
            onVotesChange={fetchVotes}
            parentLoadingVotes={votesLoading}
            onOpen={() => openFeedbackItemPopup(feedback)}
          />
        ))}
        {(fetchingFeedbacks || waiting) && (
          <div className="flex justify-center p-4">
            <MoonLoader size={24} />
          </div>
        )}
      </div>
      {showFeedbackModal && (
        <FeedbakcModal
          setShow={setShowFeedbackModal}
          onCreate={fetchFeedbacks}
        />
      )}
      {showFeedbackItemPopup && (
        <FeedbackItemPopup
          setShow={setShowFeedbackItemPopup}
          {...showFeedbackItemPopup}
          onVotesChange={fetchVotes}
          onUpdate={handleFeedbackUpdate}
          votes={votes.filter(
            (v) => v.feedbackId.toString() === showFeedbackItemPopup._id
          )}
        />
      )}
    </main>
  );
}
