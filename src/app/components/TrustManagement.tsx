import { useState } from 'react';
import { Card, Input, Button, Typography, Alert } from 'antd';

const { Title } = Typography;

const TrustManagement = ({ sdk, circlesAddress }) => {
  const [trustAddress, setTrustAddress] = useState('');
  const [trustResult, setTrustResult] = useState(null);
  const [error, setError] = useState(null);

  const trustUser = async () => {
    try {
      const avatar = await sdk.getAvatar(circlesAddress);
      const receipt = await avatar.trust(trustAddress);
      setTrustResult(`Successfully trusted: ${trustAddress}`);
    } catch (err) {
      setError(err.message || 'Failed to trust user');
    }
  };

  return (
    <Card title="Trust Management">
      <Input
        placeholder="Enter address to trust"
        value={trustAddress}
        onChange={(e) => setTrustAddress(e.target.value)}
      />
      <Button type="primary" onClick={trustUser} style={{ marginTop: '10px' }}>
        Trust User
      </Button>

      {trustResult && <Alert message={trustResult} type="success" showIcon />}
      {error && <Alert message="Error" description={error} type="error" />}
    </Card>
  );
};

export default TrustManagement;
