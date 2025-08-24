export function btn({ text, handleClick }) {
  return (
    <>
      <button
        type="button"
        className="btn btn-outline-danger"
        onClick={handleClick}
      >
        {text}
      </button>
    </>
  );
}
