import React, { ChangeEvent, FC } from "react";

interface AskInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const AskInput: FC<AskInputProps> = ({ value, onChange, onSubmit }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="w-full border border-[#828282] px-5 py-3 focus:outline-none rounded-full"
        placeholder="Ask your question here..."
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress} // Allow submission with the Enter key
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"
        onClick={onSubmit} // Call onSubmit when the button is clicked
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.0698 8.51001L9.50978 4.23001C3.75978 1.35001 1.39978 3.71001 4.27978 9.46001L5.14978 11.2C5.39978 11.71 5.39978 12.3 5.14978 12.81L4.27978 14.54C1.39978 20.29 3.74978 22.65 9.50978 19.77L18.0698 15.49C21.9098 13.57 21.9098 10.43 18.0698 8.51001ZM14.8398 12.75H9.43977C9.02978 12.75 8.68977 12.41 8.68977 12C8.68977 11.59 9.02978 11.25 9.43977 11.25H14.8398C15.2498 11.25 15.5898 11.59 15.5898 12C15.5898 12.41 15.2498 12.75 14.8398 12.75Z"
            fill="#4fc3f7"
          />
        </svg>
      </button>
    </div>
  );
};

export default AskInput;
