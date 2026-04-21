const SkeletonCard = ({ lines = 3, showImage = false }) => {
  const widths = ["w-[70%]", "w-[90%]", "w-[50%]"];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      {showImage && (
        <div className="mb-4 h-32 w-full animate-pulse rounded-xl bg-gray-200" />
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 animate-pulse rounded-full bg-gray-200 ${
              widths[index % widths.length]
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCard;
