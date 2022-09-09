export function TokenAmountInput ({ currentAmount, onChange }: {
  currentAmount: string,
  onChange: (e: any) => void
}) {
  return <div className="form-control w-full max-w-md">
    <label className="label">
      <span className="label-text">Amount</span>
    </label>
    <input
      type="text"
      value={currentAmount}
      onChange={onChange}
      placeholder="10"
      className="input input-bordered w-full max-w-md"
    />
  </div>;
}
