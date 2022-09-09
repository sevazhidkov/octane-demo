import {CACHED_MINT_TO_NAME} from "../utils/tokens";

export function MintInput({ currentMint, onChange, availableMints}: {
  currentMint: string, onChange: (e: any) => void, availableMints: string[]
}) {
  return <div className="form-control w-full max-w-md">
    <label className="label">
      <span className="label-text">Token</span>
    </label>
    <select className="select select-bordered" value={currentMint} onChange={onChange}>
      <option disabled selected value=''>Select...</option>
      { availableMints.map((mint) => (
        <option key={mint} value={mint}>{ CACHED_MINT_TO_NAME[mint] ?? mint }</option>
      ))}
    </select>
  </div>;
}
