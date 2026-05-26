import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';
import {
  PageWrapper,
  PageTitle,
  SubTitle,
  SecondaryButton,
  PrimaryButton,
} from '../../style/common.tsx';
import { api } from '../../api/auth.ts';
import { AuthContext } from '../../context/AuthContext';

interface UserLocation {
  id: string;
  name: string;
  description?: string;
  region: string;
  type: string;
  priority: number;
  is_approved: boolean;
}

export const MyLocationsPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myLocations, setMyLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyLocations = async () => {
      setError(null);
      setLoading(true);

      try {
        const response = await api.get<UserLocation[]>('/locations/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMyLocations(response.data);
      } catch (error: any) {
        console.error('Помилка завантаження власних локацій:', error);
        setError(error.response?.data?.detail || 'Не вдалося завантажити ваші точки');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyLocations();
    } else {
      setLoading(false);
      setMyLocations([]);
    }
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return (
      <PageWrapper>
        <Typography sx={{ pt: 20, textAlign: 'center' }}>
          Будь ласка, увійдіть в систему
        </Typography>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: '900px', margin: '0 auto', px: 3 }}>
        <SubTitle>My Account</SubTitle>
        <PageTitle>My Created Locations</PageTitle>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.95rem', color: '#666', maxWidth: 680 }}>
              Тут відображаються лише ті місця, які ви додали особисто. Інші користувачи їх не бачать у вашому акаунті.
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

        {error ? (
          <Typography sx={{ color: 'error.main' }}>{error}</Typography>
        ) : myLocations.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
              Ви ще не додали жодної локації.
            </Typography>
            <PrimaryButton onClick={() => navigate('/create-location')}>
              Create Your First Location
            </PrimaryButton>
          </Box>
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

        <Box sx={{ mt: 4 }}>
          <SecondaryButton
            variant="outlined"
            onClick={() => navigate('/account')}
          >
            Back to Account
          </SecondaryButton>
        </Box>
      </Box>
    </PageWrapper>
  );
};
