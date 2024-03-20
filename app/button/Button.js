export default function Button(props) {
  const extraClasses = props?.className || "";
  return (
    <button
      {...props}
      disabled={props.disabled}
      className={
        " flex items-center gap-2 py-1 px-4 rounded-md text-opacity-90 " +
        extraClasses +
        (props.primary ? " bg-blue-500 text-white " : "text-slate-600 ") +
        (props.disabled ? " bg-blue-400 text-white " : " ")
      }
    />
  );
}
