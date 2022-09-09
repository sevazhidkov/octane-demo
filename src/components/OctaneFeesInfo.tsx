import {TokenFee} from "../utils/octane";

type FeeInfo = {
  name: string,
  fee: TokenFee
}

export function OctaneFeesInfo ({ fees }: { fees: FeeInfo[] }) {
  return <div className="text-left text-sm p-1 mb-2">
    <p className="underline">Octane fees</p>
    {fees.map((feeInfo) => (
      <p key={feeInfo.name}>{feeInfo.name}: +{feeInfo.fee.fee / (10 ** feeInfo.fee.decimals)}</p>
    ))}
  </div>;
}
