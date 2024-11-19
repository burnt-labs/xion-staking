import ChevronIcon from "./ChevronIcon";

interface PaginationControlsProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export const PaginationControls = ({
  currentPage,
  onPageChange,
  totalPages,
}: PaginationControlsProps) => (
  <div className="mb-40 flex items-center justify-center gap-4">
    <div
      className="hover:cursor-pointer hover:bg-white/5"
      onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      onKeyDown={() => {}}
      role="button"
      tabIndex={0}
    >
      <ChevronIcon />
    </div>

    <div className="flex items-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <div
          className={`relative flex h-10 w-10 items-center justify-center rounded ${
            pageNum === currentPage
              ? "bg-white/10"
              : "hover:cursor-pointer hover:bg-white/5"
          }`}
          key={pageNum}
          onClick={() => pageNum !== currentPage && onPageChange(pageNum)}
          onKeyDown={() => {}}
          role="button"
          tabIndex={pageNum + 1}
        >
          <span
            className={`text-base ${
              pageNum === currentPage ? "text-white" : "text-white/40"
            }`}
          >
            {pageNum}
          </span>
        </div>
      ))}
    </div>

    <div
      className="-rotate-180 hover:cursor-pointer hover:bg-white/5"
      onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
      onKeyDown={() => {}}
      role="button"
      tabIndex={totalPages + 1}
    >
      <ChevronIcon />
    </div>
  </div>
);
