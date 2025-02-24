type HelptextProps = {
  content?: string;
  isValid?: boolean;
  currentLength?: number;
};

const HelpText: React.FC<HelptextProps> = ({
  content,
  isValid,
  currentLength,
}) => {
  return (
    <p
      className={`mt-1 text-body-3 font-medium text-gray ${isValid !== undefined && currentLength && currentLength > 0 && !isValid && "text-primary"}`}
      slot="help-text"
    >
      {content}
    </p>
  );
};

export default HelpText;
