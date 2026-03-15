function LoadingSpinner({ size = "md", text = null }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`inline-block border-gray-300 border-t-sky-600 rounded-full animate-spin ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
