import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Stack, Typography, CircularProgress, Divider } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import {
  PageWrapper,
  PageTitle,
  SubTitle,
  CommonInput,
  PrimaryButton,
  SecondaryButton,
} from '../../style/common.tsx';
import { api } from '../../api/auth.ts';
import { AuthContext } from '../../context/AuthContext';

interface UserData {
  full_name: string;
  email: string;
  avatarUrl?: string;
}

export const AccountPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Помилка завантаження профілю:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const handleSave = async () => {
    try {
      await api.put('/users/me',
        {full_name: user?.full_name},
        {
        headers: {Authorization: `Bearer ${token}`},
      });
    } catch (error) {
      console.error('Помилка при збереженні:', error);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}><CircularProgress /></Box>;
  if (!user) return <Typography sx={{ pt: 20, textAlign: 'center' }}>Будь ласка, увійдіть в систему</Typography>;

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: '900px', margin: '0 auto', px: 3 }}>
        <SubTitle>Profile Settings</SubTitle>
        <PageTitle>My Account</PageTitle>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 8 },
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: '250px' },
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <Avatar
              src={user.avatarUrl}
              sx={{
                width: 160,
                height: 160,
                margin: '0 auto',
                mb: 2,
                bgcolor: '#f0f0f0',
                color: '#000',
                border: '1px solid #e0e0e0',
                fontSize: '3rem',
              }}
            >
              {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              Status: Active Explorer
            </Typography>
            <SecondaryButton
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.6rem', width: '100%' }}
            >
              Change Photo
            </SecondaryButton>
          </Box>

          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Stack spacing={4}>
              <Box>
                <SubTitle>Full Name</SubTitle>
                <CommonInput fullWidth
                             value={user.full_name}
                             onChange={(e) => setUser({...user, full_name: e.target.value})}
                />
              </Box>

              <Box>
                <SubTitle>Email Address</SubTitle>
                <CommonInput fullWidth value={user.email} disabled />
              </Box>

              <Box
                sx={{
                  pt: 2,
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                }}
              >
                <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        <Box>
          <SubTitle>Contribute</SubTitle>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}
          >
            Add a Point of Interest
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#666', mb: 3, maxWidth: 480 }}>
            Know an interesting place in Ukraine? Pin it on the map and share it with other travelers.
          </Typography>
          <SecondaryButton
            variant="outlined"
            onClick={() => navigate('/create-location')}
            startIcon={<AddLocationAltIcon />}
          >
            Create New Place
          </SecondaryButton>
        </Box>
      </Box>
    </PageWrapper>
  );
};
