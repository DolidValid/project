import PropTypes from "prop-types";

export const RedButton = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,

  ...props
}) => {
  // Base button classes
  let buttonClasses = `btn rounded-pill fw-bold ${className}`;

  // Size classes
  const sizeClasses = {
    sm: "py-2 px-4",
    md: "py-2 px-5",
    lg: "py-3 px-6",
  };

  // Variant classes (all red-themed)
  const variantClasses = {
    primary: "btn-danger", // Solid red
    outline: "btn-outline-danger border-2", // Red outline
    ghost: "bg-transparent text-danger border-0", // Text only
    gradient: "bg-gradient-to-r from-red-600 to-red-800 text-white", // Gradient red
    soft: "bg-red-100 text-red-800", // Soft red background
  };

  buttonClasses += ` ${sizeClasses[size]} ${variantClasses[variant]}`;

  if (fullWidth) {
    buttonClasses += " w-100";
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      style={{
        transition: "all 0.3s ease",
        letterSpacing: "0.5px",
        // eslint-disable-next-line react/prop-types
        ...props.style,
      }}
      onMouseOver={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
        }
      }}
      onMouseOut={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "";
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

RedButton.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "outline", "ghost", "gradient", "soft"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default RedButton;
