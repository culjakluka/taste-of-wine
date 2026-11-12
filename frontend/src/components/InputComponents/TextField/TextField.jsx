// One form field: a label, an input and, below it, either an error or helper text.
// The parent keeps the value in its own state and passes the setter (setSpecificState).
const TextField = ({ label, id, type, value, setSpecificState, placeholder, error, help }) => {
  return (
    <div className={error ? "field field--invalid" : "field"}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="field__control"
        id={id}
        type={type || "text"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setSpecificState(e.target.value)}
      />
      {error && <span className="field__error">{error}</span>}
      {!error && help && <span className="field__help">{help}</span>}
    </div>
  );
};

export default TextField;
