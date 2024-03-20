export default function Avatar({ url = null }) {
  return (
    <div>
      <div className="rounded-full bg-blue-200 w-10 h-10 overflow-hidden">
        {!!url && <img src={url} alt="avatar" />}
      </div>
    </div>
  );
}
