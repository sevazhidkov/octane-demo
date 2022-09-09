export function RecipientWalletAddressInput ({ address, onChange, suggestion, onSuggestionClick }) {
  return <div className="form-control w-full max-w-md">
    <label className="label">
      <span className="label-text">Recipient wallet address</span>
    </label>
    <input
      type="text" placeholder="2QSwjQKDS..." className="input input-bordered w-full max-w-md"
      value={address}
      onChange={onChange}
    />
    <span className="text-left text-xs p-1">
      For example, <a className="cursor-pointer underline" onClick={onSuggestionClick}>{suggestion}</a>
    </span>
  </div>;
}
