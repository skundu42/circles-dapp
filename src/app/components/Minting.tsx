import { useState } from 'react';
import { Card, Button, Typography, Alert } from 'antd';

const { Title } = Typography;

const Minting = ({ sdk, circlesAddress }) => {
  const [mintableAmount, setMintableAmount] = useState(null);
  const [mintResult, setMintResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchMintableAmount = async () => {
    try {
      const avatar = await sdk.getAvatar(circlesAddress);
      const amount = await avatar.getMintableAmount();
      setMintableAmount(amount.toString());
    } catch (err) {
      setError(err.message || 'Failed to fetch mintable amount');
    }
  };

  const mintCircles = async () => {
    try {
      const avatar = await sdk.getAvatar(circlesAddress);
      await avatar.personalMint();
      setMintResult('Successfully minted Circles tokens');
    } catch (err) {
      setError(err.message || 'Failed to mint Circles tokens');
    }
  };

  return (
    <Card title="Minting">
      <Button type="primary" onClick={fetchMintableAmount}>
        Fetch Mintable Amount
      </Button>

      {mintableAmount && (
        <div>
          <Title level={4}>Mintable Amount: {mintableAmount} CRC</Title>
          <Button type="primary" onClick={mintCircles}>
            Mint Circles Tokens
          </Button>
        </div>
      )}

      {mintResult && <Alert message={mintResult} type="success" />}
      {error && <Alert message="Error" description={error} type="error" />}
    </Card>
  );
};

export default Minting;
