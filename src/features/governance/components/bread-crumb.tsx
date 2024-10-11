import Link from "next/link";

interface BreadCrumbProps {
  proposalId: string;
}

export function BreadCrumbNav({ proposalId }: BreadCrumbProps) {
  return (
    <div className="flex flex-row justify-between text-left">
      <div>
        <Link
          href="/governance/"
          className="font-['Akkurat LL'] text-sm font-normal uppercase leading-tight text-white underline"
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
