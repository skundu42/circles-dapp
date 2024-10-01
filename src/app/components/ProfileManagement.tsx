import { useState } from 'react';
import { Card, Button, Typography, Alert } from 'antd';
import { Sdk } from '@circles-sdk/sdk';

const { Title, Text } = Typography;

const ProfileManagement = ({ sdk, circlesAddress }) => {
  const [profileCreated, setProfileCreated] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  const createProfile = async () => {
    try {
      const avatar = await sdk.registerHuman();
      setProfileCreated(true);
      setProfileData(avatar);
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    }
  };

  const fetchProfile = async () => {
    try {
      const avatar = await sdk.getAvatar(circlesAddress);
      setProfileData(avatar);
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    }
  };

  return (
    <Card title="Profile Management">
      {!profileCreated ? (
        <Button type="primary" onClick={createProfile}>
          Create Profile
        </Button>
      ) : (
        <Button type="primary" onClick={fetchProfile}>
          Fetch Profile Data
        </Button>
      )}

      {profileData && (
        <div>
          <Title level={4}>Profile Data:</Title>
          <Text>{JSON.stringify(profileData, null, 2)}</Text>
        </div>
      )}

      {error && <Alert message="Error" description={error} type="error" />}
    </Card>
  );
};

export default ProfileManagement;
