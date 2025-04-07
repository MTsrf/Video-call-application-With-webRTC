/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from "antd";
import { TextField } from "../components/TextField";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const onFinish = async (values: any) => {
    await login(values);
    navigate("/");
  };
  return (
    <Form
      name="login"
      onFinish={onFinish}
      wrapperCol={{ flex: "auto" }}
      requiredMark={false}
    >
      <Form.Item
        label="Enter Room ID"
        layout="vertical"
        name="roomId"
        rules={[{ required: true, message: "Required Field" }]}
        style={{ marginBottom: "14px" }}
      >
        <TextField className="h-9 rounded-sm" />
      </Form.Item>

      <Form.Item
        label="Enter Username"
        layout="vertical"
        name="username"
        rules={[{ required: true, message: "Required Field" }]}
      >
        <TextField className="h-9 rounded-sm" />
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit" className="h-10 p-10 w-full">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
