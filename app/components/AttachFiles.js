import { useState } from "react";
import { MoonLoader } from "react-spinners";
import axios from "axios";

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

export default function AttachFiles({ onNewFiles }) {
  const [isUploading, setIsUploading] = useState(false);
  async function handleAttachFiles(e) {
    e.preventDefault();
    const files = [...e.target.files];
    // if (files?.length) return;
    setIsUploading(true);
    const data = new FormData();
    for (const file of files) {
      data.append("file", file);
    }
    const res = await axios.post("/api/upload", data);
    onNewFiles(res.data);
    setIsUploading(false);
  }
  return (
    <label className={"flex items-center gap-1 py-2 px-4 cursor-pointer"}>
      {isUploading && <MoonLoader size={17} />}
      {!isUploading && <ArrowUpTrayIcon className="w-4 h-4" />}
      <span className={isUploading ? "text-gray-300 " : "text-gray-600 "}>
        {isUploading ? "Uploading..." : "Attach files"}
      </span>
      <input
        type="file"
        multiple="multiple"
        onChange={handleAttachFiles}
        className="hidden"
      />
    </label>
  );
}
