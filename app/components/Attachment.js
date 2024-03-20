import { PaperClipIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function Attachment({
  link,
  showDeleteIcon = false,
  handleRemoveFile,
}) {
  return (
    <a href={link} target="_blank" className="flex items-center h-16 relative">
      {showDeleteIcon && (
        <button
          onClick={(e) => handleRemoveFile(e, link)}
          className="absolute -top-2 -right-2 bg-white/60 rounded-full w-4 h-4"
        >
          <XCircleIcon className="w-5 h-5 text-slate-600" />
        </button>
      )}

      {/.(jpg|png)$/.test(link) ? (
        <img className="h-16 w-auto rounded-md" src={link} alt="" />
      ) : (
        <div className="bg-gray-200 h-8 p-2 flex items-center rounded-md">
          <PaperClipIcon className="w-4 h-4" />
          ...{link.toString().split("/")[3].substring(13)}
        </div>
      )}
    </a>
  );
}
