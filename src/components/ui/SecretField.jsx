export function SecretField({
  label,
  name,
  configured,
  masked,
  value,
  onChange,
  replacing,
  onReplace,
  onCancelReplace,
}) {
  if (configured && !replacing) {
    return (
      <div className="field">
        <label>{label}</label>
        <div className="secret-box spread">
          <span>************** configured</span>
          <button className="btn btn-secondary btn-small" type="button" onClick={onReplace}>
            Replace {label}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        className="input"
        type="password"
        autoComplete="off"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={configured ? "Enter a new value to replace" : `Enter ${label.toLowerCase()}`}
      />
      {configured ? (
        <button className="btn btn-ghost btn-small" type="button" onClick={onCancelReplace}>
          Keep current {label.toLowerCase()}
        </button>
      ) : null}
    </div>
  );
}
