import { Input, InputProps } from "antd";
import React from "react";

interface TextFieldProps extends InputProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextField: React.FC<TextFieldProps> = ({ onChange, ...props }) => {
  return <Input onChange={onChange} {...props} />;
};
