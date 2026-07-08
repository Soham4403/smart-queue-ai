export default function Loader({ text = "Please wait..." }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      {text}
    </span>
  );
}
