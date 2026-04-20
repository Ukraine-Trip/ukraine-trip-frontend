import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import {
  MenuPaper as Paper,
  NavigationAction as BottomNavigationAction,
  StyledBottomNavigation as BottomNavigation,
} from './styled.tsx';

export const Menu: React.FC = () => {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/create-route'); // <-- Оновили шлях тут!
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
          icon={<AddCircleOutlineIcon />}
          disableRipple
        />
        <BottomNavigationAction
          id="nav-bookmarks-btn"
          icon={<MapOutlinedIcon />}
          disableRipple
        />
        <BottomNavigationAction
          id="nav-profile-btn"
          icon={<PersonOutlineIcon />}
          disableRipple
        />
      </BottomNavigation>
    </Paper>
  );
};
