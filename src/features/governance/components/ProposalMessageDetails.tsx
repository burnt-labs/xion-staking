import React from "react";

import { ProposalMessage } from "../lib/types";

interface ProposalMessageDetailsProps {
  messages: ProposalMessage[];
}

const renderValue = (value: any, key: string): React.ReactNode => {
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

const renderMessageContent = (message: any) => {
  return Object.entries(message).map(([key, value]) => {
    if (key === "@type") return null;
    return (
      <div key={key} className="mb-2 flex items-start justify-between">
        <span className="text-white/60">{key}</span>
        <div className="max-w-[70%] text-right">{renderValue(value, key)}</div>
      </div>
    );
  });
};

export const ProposalMessageDetails: React.FC<ProposalMessageDetailsProps> = ({
  messages,
}) => {
  return (
    <div className="rounded-lg bg-white/5 p-6">
      {messages.map((message, index) => (
        <div key={index} className="mb-6 last:mb-0">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-white/60">Type</span>
            <span className="font-mono text-white">{message["@type"]}</span>
          </div>
          {renderMessageContent(message)}
        </div>
      ))}
    </div>
  );
};
