import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';

import {
  MenuPaper as Paper,
  NavigationAction as BottomNavigationAction,
  StyledBottomNavigation as BottomNavigation,
} from './styled.tsx';
import { AuthContext } from '../../context/AuthContext.tsx';

export const Menu: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const isAuthenticated = Boolean(token);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    if (isAuthenticated) {
      switch (newValue) {
        case 0:
          navigate('/');
          break;
        case 1:
          navigate('/create-route');
          break;
        case 2:
          navigate('/map-page');
          break;
        case 3:
          navigate('/login');
          break;
        default:
          break;
      }
    } else {
      switch (newValue) {
        case 0:
          navigate('/');
          break;
        case 1:
          navigate('/create-route');
          break;
        case 2:
          navigate('/account');
          break;
        default:
          break;
      }
    }
  };

  return (
    <Paper elevation={3}>
      <BottomNavigation
        showLabels={false}
        value={value}
        onChange={handleChange}
      >
        <BottomNavigationAction
          id="nav-home-btn"
          icon={<HomeOutlinedIcon />}
          disableRipple
        />
        <BottomNavigationAction
          id="nav-add-btn"
          icon={<SearchIcon />}
          disableRipple
        />
        {isAuthenticated && (
          <BottomNavigationAction
            id="nav-bookmarks-btn"
            icon={<MapOutlinedIcon />}
            disableRipple
          />
        )}
        <BottomNavigationAction
          id="nav-profile-btn"
          icon={<PersonOutlineIcon />}
          disableRipple
        />
      </BottomNavigation>
    </Paper>
  );
};
