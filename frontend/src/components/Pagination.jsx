export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        Previous
      </button>
      <span className="text-xs font-semibold text-zinc-400">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}
