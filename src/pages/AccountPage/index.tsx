import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Avatar, Stack, Typography, CircularProgress, Divider, List, ListItem, ListItemText, Chip, Collapse } from '@mui/material';
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
import { getMyTrips } from '../../api/trips.ts';
import type { Trip } from '../../types/types.ts';

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

const formatTripDate = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const fmt = (d: Date) =>
    d.toLocaleString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  const s = new Date(start);
  if (!end || start === end) return fmt(s);
  return `${fmt(s)} — ${fmt(new Date(end))}`;
};

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
  const [showItinerary, setShowItinerary] = useState(false);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token.replace(/["']/g, '')}`,
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
            Authorization: `Bearer ${token.replace(/["']/g, '')}`,
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
    if (!token) return;
    const fetchMyTrips = async () => {
      setTripsError(null);
      setTripsLoading(true);
      try {
        const trips = await getMyTrips(token);
        setMyTrips(trips);
      } catch (error: any) {
        console.error('Помилка завантаження маршрутів:', error);
        setTripsError('Не вдалося завантажити ваші маршрути');
      } finally {
        setTripsLoading(false);
      }
    };
    fetchMyTrips();
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showLocations') === '1') {
      setShowLocations(true);
    }
    if (params.get('showItinerary') === '1') {
      setShowItinerary(true);
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
        headers: { Authorization: `Bearer ${token.replace(/["']/g, '')}` },
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 1, flexWrap: 'wrap' }}>
          <SecondaryButton
            variant="outlined"
            onClick={() => setShowItinerary((prev) => !prev)}
          >
            {showItinerary ? 'Hide my itinerary' : 'View my itinerary'}
          </SecondaryButton>
          <SecondaryButton
            variant="outlined"
            onClick={() => setShowLocations((prev) => !prev)}
          >
            {showLocations ? 'Hide my locations' : 'View my locations'}
          </SecondaryButton>
        </Box>

        <Collapse in={showItinerary}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box>
                <SubTitle>My Itineraries</SubTitle>
                <Typography sx={{ fontSize: '0.95rem', color: '#666', maxWidth: 680 }}>
                  Тут відображаються маршрути, які ви створили. Ви можете переглянути їх або побудувати новий маршрут.
                </Typography>
              </Box>
              <SecondaryButton
                variant="outlined"
                onClick={() => navigate('/itinerary')}
                sx={{ alignSelf: 'center' }}
              >
                Create New Itinerary
              </SecondaryButton>
            </Box>

            {tripsLoading ? (
              <Typography sx={{ color: 'text.secondary' }}>Завантаження ваших маршрутів...</Typography>
            ) : tripsError ? (
              <Typography sx={{ color: 'error.main' }}>{tripsError}</Typography>
            ) : myTrips.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                  Ви ще не створили жодного маршруту.
                </Typography>
                <PrimaryButton onClick={() => navigate('/itinerary')}>
                  Build Your First Itinerary
                </PrimaryButton>
              </Box>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {myTrips.map((trip) => (
                  <ListItem
                    key={trip.id}
                    sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2, borderBottom: '1px solid #eee' }}
                  >
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <ListItemText
                        primary={trip.title}
                        secondary={formatTripDate(trip.start_date, trip.end_date)}
                        secondaryTypographyProps={{ sx: { color: 'text.secondary' } }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                          label={`${trip.trip_nodes.length} ${trip.trip_nodes.length === 1 ? 'point' : 'points'}`}
                          size="small"
                        />
                        <SecondaryButton
                          variant="outlined"
                          size="small"
                          sx={{ fontSize: '0.65rem', py: '6px', px: '14px' }}
                          onClick={() =>
                            navigate('/map-page', {
                              state: {
                                tripMeta: {
                                  title: trip.title,
                                  description: trip.description,
                                  start_date: trip.start_date,
                                  end_date: trip.end_date,
                                  waypoints: trip.trip_nodes.map((n) => ({
                                    name: n.location?.name ?? '',
                                    order_index: n.order_index,
                                  })),
                                },
                              },
                            })
                          }
                        >
                          View on Map
                        </SecondaryButton>
                      </Box>
                    </Box>
                    {trip.description && (
                      <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: '0.9rem' }}>
                        {trip.description}
                      </Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Divider sx={{ mb: 3 }} />
        </Collapse>

        <Collapse in={showLocations}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box>
                <SubTitle>My Created Locations</SubTitle>
                <Typography sx={{ fontSize: '0.95rem', color: '#666', maxWidth: 680 }}>
                  Тут відображаються лише ті місця, які ви додали особисто. Інші користувачі їх не бачать у вашому акаунті.
                </Typography>
              </Box>
              <SecondaryButton
                variant="outlined"
                onClick={() => navigate('/create-location')}
                sx={{ alignSelf: 'center' }}
              >
                Create New Place
              </SecondaryButton>
            </Box>

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
