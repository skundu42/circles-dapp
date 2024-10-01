import { useState, useEffect } from 'react';
import { Card, Typography, Button, Alert } from 'antd';

const { Title, Text } = Typography;

const BalanceManagement = ({ sdk, circlesAddress }) => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      const fetchedBalance = await sdk.data.getTotalBalance(circlesAddress, true);
      setBalance(fetchedBalance);
    } catch (err) {
      setError(err.message || 'Failed to fetch balance');
    }
  };

  useEffect(() => {
    if (sdk && circlesAddress) {
      fetchBalance();
    }
  }, [sdk, circlesAddress]);

  return (
    <Card title="Balance Management">
      <Button type="primary" onClick={fetchBalance}>
        Fetch Balance
      </Button>

      {balance && (
        <div>
          <Title level={4}>Circles Balance:</Title>
          <Text>{balance} CRC</Text>
        </div>
      )}

      {error && <Alert message="Error" description={error} type="error" />}
    </Card>
  );
};

export default BalanceManagement;
