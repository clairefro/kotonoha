import React from "react";

interface BookshelfProps {
  items: Array<{
    id: string;
    title: string;
    item_type: string;
  }>;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Bookshelf: React.FC<BookshelfProps> = ({
  items,
  page,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(items.length / pageSize);
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  // Bookshelf layout variables
  const shelfCount = 4;
  const shelfWidth = 550;
  const shelfHeight = 90;
  const shelfGap = 10;
  const bookWidth = 60;
  const bookHeight = 80;
  const bookSpacing = 24; // Increased spacing to prevent overlap
  const booksPerShelf = Math.floor(
    (shelfWidth - 20) / (bookWidth + bookSpacing),
  );
  const shelves: Array<typeof pagedItems> = Array.from(
    { length: shelfCount },
    (_, shelfIdx) =>
      pagedItems.slice(
        shelfIdx * booksPerShelf,
        (shelfIdx + 1) * booksPerShelf,
      ),
  );

  return (
    <div>
      <svg
        width={shelfWidth}
        height={shelfCount * (shelfHeight + shelfGap) + 10}
        style={{ background: "#fafafa", border: "1px solid #ccc" }}
      >
        {/* Shelves */}
        {Array.from({ length: shelfCount }).map((_, shelfIdx) => (
          <rect
            key={shelfIdx}
            x={0}
            y={shelfIdx * (shelfHeight + shelfGap) + shelfHeight}
            width={shelfWidth}
            height={8}
            fill="#333"
          />
        ))}
        {/* Books */}
        {shelves.map((shelf, shelfIdx) =>
          shelf.map((item, i) => {
            const x = 20 + i * (bookWidth + bookSpacing);
            const y = shelfIdx * (shelfHeight + shelfGap) + 10;
            // Calculate font size to fit text in book width
            const maxFontSize = 13;
            const minFontSize = 7;
            const padding = 8;
            // Estimate font size based on title length
            const charsPerLine = Math.floor((bookWidth - 2 * padding) / 7); // 7px per char
            const lines = Math.ceil(item.title.length / charsPerLine);
            const fontSize = Math.max(
              Math.min(
                Math.floor((bookHeight - 2 * padding) / lines),
                maxFontSize,
              ),
              minFontSize,
            );
            // Split title into lines
            const titleLines = [];
            for (let i = 0; i < item.title.length; i += charsPerLine) {
              titleLines.push(item.title.slice(i, i + charsPerLine));
            }
            return (
              <a
                key={item.id}
                href={`/items/${item.id}`}
                style={{ textDecoration: "none" }}
                tabIndex={0}
                aria-label={item.title}
              >
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={bookWidth}
                    height={bookHeight}
                    fill="#fff"
                    stroke="#000"
                  />
                  {titleLines.map((line, idx) => (
                    <text
                      key={idx}
                      x={x + bookWidth / 2}
                      y={
                        y +
                        bookHeight / 2 -
                        ((titleLines.length - 1) * fontSize) / 2 +
                        idx * fontSize
                      }
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill="#000"
                      dominantBaseline="middle"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              </a>
            );
          }),
        )}
      </svg>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Prev
        </button>
        <span style={{ margin: "0 12px" }}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// (moved inside component)
export default Bookshelf;
