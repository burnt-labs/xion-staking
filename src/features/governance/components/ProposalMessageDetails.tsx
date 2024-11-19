import React from "react";

import type { ProposalMessage } from "../lib/types";

interface ProposalMessageDetailsProps {
  messages: ProposalMessage[];
}

const renderValue = (value: any): React.ReactNode => {
  if (typeof value === "object" && value !== null) {
    return (
      <div className="mt-1 max-h-60 overflow-y-auto">
        <div className="rounded bg-white/10 p-2 text-sm text-white">
          {JSON.stringify(value, null, 2)}
        </div>
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div className="mt-1 max-h-60 overflow-y-auto">
        <pre className="whitespace-pre-wrap break-all rounded bg-white/10 p-2 text-sm text-white">
          {value}
        </pre>
      </div>
    );
  }

  return <span className="font-mono text-white">{String(value)}</span>;
};

const renderMessageContent = (message: any) =>
  Object.entries(message).map(([key, value]) =>
    key === "@type" ? null : (
      <div className="mb-2 flex items-start justify-between" key={key}>
        <span className="text-white/60">{key}</span>
        <div className="max-w-[70%] text-right">{renderValue(value)}</div>
      </div>
    ),
  );

export const ProposalMessageDetails: React.FC<ProposalMessageDetailsProps> = ({
  messages,
}) => (
  <div className="rounded-lg bg-white/5 p-6">
    {messages.map((message, index) => (
      <div className="mb-6 last:mb-0" key={index}>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-white/60">Type</span>
          <span className="font-mono text-white">{message["@type"]}</span>
        </div>
        {renderMessageContent(message)}
      </div>
    ))}
  </div>
);
