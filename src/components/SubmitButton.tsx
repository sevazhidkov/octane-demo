export function SubmitButton ({ onClick, disabled = false, text, disabledText = null }) {
  return <div>
    <button
      className="group disabled:border-0 w-68 m-2 btn bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 mt-5"
      onClick={onClick}
      disabled={disabled}
    >
      {disabledText && (
        <div className="hidden group-disabled:block">
          {disabledText}
        </div>
      )}
      <span className="block group-disabled:hidden" >
        {text}
      </span>
    </button>
  </div>;
}
