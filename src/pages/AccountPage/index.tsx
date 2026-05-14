import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Avatar, Stack, Typography, CircularProgress, Divider, List, ListItem, ListItemText, Chip, Collapse } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import {
  PageWrapper,
  PageTitle,
  SubTitle,
  CommonInput,
  PrimaryButton,
  SecondaryButton,
} from '../../style/common.tsx';
import { api, hashPassword } from '../../api/auth.ts';
import { AuthContext } from '../../context/AuthContext';

interface UserData {
  full_name: string;
  email: string;
  avatarUrl?: string;
  password?: string;
}

interface UserLocation {
  id: string;
  name: string;
  description?: string;
  region: string;
  type: string;
  priority: number;
  is_approved: boolean;
}

export const AccountPage: React.FC = () => {
  const { token, setUser: setAuthUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [myLocations, setMyLocations] = useState<UserLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [showLocations, setShowLocations] = useState(false);

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
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchMyLocations = async () => {
      setLocationsError(null);
      setLocationsLoading(true);

      try {
        const response = await api.get<UserLocation[]>('/locations/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMyLocations(response.data);
      } catch (error: any) {
        console.error('Помилка завантаження власних локацій:', error);
        setLocationsError(error.response?.data?.detail || 'Не вдалося завантажити ваші точки');
      } finally {
        setLocationsLoading(false);
      }
    };

    if (token) {
      fetchMyLocations();
    } else {
      setLocationsLoading(false);
      setMyLocations([]);
    }
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showLocations') === '1') {
      setShowLocations(true);
    }
  }, [location.search]);

  const handleSave = async () => {
    setMessage(null);
    try {
      const payload: any = {
        full_name: user?.full_name,
      };

      if (newPassword) {
        payload.password = await hashPassword(newPassword);
      }

      const response = await api.put('/users/me', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuthUser(response.data);
      setMessage({ text: 'Профіль успішно оновлено!', type: 'success' });
      setNewPassword('');
    } catch (error: any) {
      console.error('Помилка при збереженні:', error);
      setMessage({
        text: error.response?.data?.detail || 'Помилка при збереженні змін',
        type: 'error'
      });
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
                <CommonInput
                  fullWidth
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                  value={user.email}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
              </Box>

              <Box>
                <SubTitle>New Password</SubTitle>
                <CommonInput
                  fullWidth
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Box>

              {message && (
                <Typography
                  sx={{
                    color: message.type === 'success' ? 'success.main' : 'error.main',
                    fontSize: '0.85rem',
                    mt: 1
                  }}
                >
                  {message.text}
                </Typography>
              )}

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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <SecondaryButton
            variant="outlined"
            onClick={() => setShowLocations((prev) => !prev)}
          >
            {showLocations ? 'Hide my locations' : 'View my locations'}
          </SecondaryButton>
        </Box>

        <Collapse in={showLocations}>
          <Box>
            <SubTitle>My Created Locations</SubTitle>
            <Typography sx={{ fontSize: '0.95rem', color: '#666', mb: 3, maxWidth: 680 }}>
              Тут відображаються лише ті місця, які ви додали особисто. Інші користувачі їх не бачать у вашому акаунті.
            </Typography>

          {locationsLoading ? (
            <Typography sx={{ color: 'text.secondary' }}>Завантаження ваших точок...</Typography>
          ) : locationsError ? (
            <Typography sx={{ color: 'error.main' }}>{locationsError}</Typography>
          ) : myLocations.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>Ви ще не додали жодної локації.</Typography>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {myLocations.map((location) => (
                <ListItem key={location.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <ListItemText
                      primary={location.name}
                      secondary={location.region}
                      secondaryTypographyProps={{ sx: { color: 'text.secondary' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip label={location.type} size="small" />
                      <Chip label={`Priority ${location.priority}`} size="small" />
                      <Chip label={location.is_approved ? 'Approved' : 'Pending'} color={location.is_approved ? 'success' : 'warning'} size="small" />
                    </Box>
                  </Box>
                  {location.description ? (
                    <Typography sx={{ mt: 1, color: 'text.secondary' }}>{location.description}</Typography>
                  ) : null}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
      </Box>
    </PageWrapper>
  );
};
