import Link from "next/link";

function useMarkdownParser() {
  return ({ text }: { text: string }) => {
    if (!text) return <pre />;

    const result: (React.ReactNode | string)[] = [];
    const lines = text.split(/\\n|\n/);

    lines.forEach((line, i) => {
      if (line.startsWith("# ")) {
        result.push(
          <h1
            className="font-['Akkurat LL'] mb-4 font-bold leading-none text-white"
            key={i}
          >
            {line.replace("# ", "")}
          </h1>,
        );
      } else if (line.startsWith("## ")) {
        result.push(
          <h2
            className="font-['Akkurat LL'] mb-4 font-bold leading-none text-white"
            key={i}
          >
            {line.replace("## ", "")}
          </h2>,
        );
      } else if (line.startsWith("### ")) {
        result.push(
          <h3
            className="font-['Akkurat LL'] mb-4 font-bold leading-none text-white"
            key={i}
          >
            {line.replace("### ", "")}
          </h3>,
        );
      } else {
        const lineResult: (React.ReactNode | string)[] = [];

        const pattern =
          /\*\*(.*?)\*\*|`(.*?)`|(https?:\/\/[^\s]+)|\[(.*?)\]\((https?:\/\/[^\s]+)\)/g;

        const fixedLine = line.startsWith("- ") ? line.replace("- ", "") : line;

        let match = pattern.exec(fixedLine);
        let lastIndex = 0;

        while (match) {
          lineResult.push(fixedLine.slice(lastIndex, match.index));

          if (match[1]) {
            // bold text
            lineResult.push(
              <b key={`${i}-${lineResult.length}`}>{match[1]}</b>,
            );
          } else if (match[2]) {
            // code
            lineResult.push(
              <code key={`${i}-${lineResult.length}`}>{match[2]}</code>,
            );
          } else if (match[3]) {
            // plain URL
            lineResult.push(
              <Link
                href={match[3]}
                key={`${i}-${lineResult.length}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {match[3]}
              </Link>,
            );
          } else if (match[4] && match[5]) {
            lineResult.push(
              <Link
                href={match[5]}
                key={`${i}-${lineResult.length}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {match[4]}
              </Link>,
            );
          }

          ({ lastIndex } = pattern);
          match = pattern.exec(fixedLine);
        }

        lineResult.push(fixedLine.slice(lastIndex));

        if (line.startsWith("- ")) {
          result.push(<li key={i}>{lineResult}</li>);
        } else {
          result.push(
            lineResult.length >= 1 &&
              lineResult[0] !== "\r" &&
              !!lineResult[0] ? (
              <p key={i}>{lineResult}</p>
            ) : (
              <br />
            ),
          );
        }
      }
    });

    return <div className="whitespace-pre-wrap break-words">{result}</div>;
  };
}

export default useMarkdownParser;
