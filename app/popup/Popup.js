import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function Popup({ setShow, children, title, narrow }) {
  function close(e) {
    e.preventDefault();
    e.stopPropagation();
    setShow(false);
  }

  return (
    <div
      onClick={close}
      className="flex md:items-center fixed inset-0 bg-white/70 md:bg-black/70"
    >
      <button
        onClick={close}
        className="hidden md:block fixed top-2 right-2 md:text-white"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <div className="w-full h-full overflow-y-scroll">
        <div
          onClick={(e) => e.stopPropagation()}
          className={
            (narrow ? "md:max-w-sm " : "md:max-w-2xl ") +
            "bg-white md:my-8 md:mx-auto md:rounded-lg overflow-hidden"
          }
        >
          <div className="relative min-h-[40px] md:min-h-0">
            <button onClick={close} className="absolute top-4 left-8 md:hidden">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            {!!title && (
              <h2 className="text-center py-4 border-b font-semibold">
                {title}
              </h2>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
