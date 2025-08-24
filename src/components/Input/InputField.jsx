/* eslint-disable react/prop-types */

export const InputField = ({
  type = "text",
  name,
  id,
  placeholder,
  icon,
  ...props
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="form-label visually-hidden">
      {placeholder}
    </label>
    <div className="input-group">
      {icon && (
        <span className="input-group-text bg-transparent border-0">
          <i className={`bi bi-${icon} text-muted`}></i>
        </span>
      )}
      <input
        type={type}
        name={name}
        id={id}
        className="form-control border-0 border-bottom rounded-0"
        placeholder={placeholder}
        style={{ boxShadow: "none" }}
        {...props}
      />
    </div>
  </div>
);
export default InputField;
