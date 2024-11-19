import Link from "next/link";

interface BreadCrumbProps {
  proposalId: string;
}

export function BreadCrumbNav({ proposalId }: BreadCrumbProps) {
  return (
    <div className="flex flex-row justify-between text-left">
      <div>
        <Link
          className="font-['Akkurat LL'] text-sm font-normal uppercase leading-tight text-white underline"
          href="/governance/"
        >
          Governance
        </Link>
        <span className="font-['Akkurat LL'] text-sm font-normal uppercase leading-tight text-white">
          {" "}
          &gt; Proposal {proposalId}
        </span>
      </div>
    </div>
  );
}
